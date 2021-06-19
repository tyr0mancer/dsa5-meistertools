import {Meistertools, moduleName} from "../meistertools.js";
import {MeisterApplication} from "../util/meister-application.js";

import SceneDirector from "./scene-director.js";
import NscFactory from "./nsc-factory.js";
import {generalDefaultSettings, SECRET_INGREDIENTS} from "../config/general.config.js";

import SceneParser from "../src/scene-parser.js";


export default class MeistertoolsSettings extends MeisterApplication {

    static get meisterModule() {
        return {name: "Settings", icon: "fas fa-cog", key: "settings", class: MeistertoolsSettings}
    }

    constructor(moduleKey = MeistertoolsSettings.meisterModule.key) {
        super(moduleKey);
        this._reloadSettings()
        this.selectOptions = {
            actorPacks: game.packs.filter(p => p.metadata.entity === 'Actor'),
            itemPacks: game.packs.filter(p => p.metadata.entity === 'Item'),
            scenePacks: game.packs.filter(p => p.metadata.entity === 'Scene'),
            sceneFolders: game.folders.entities.filter(f => f.type === "Scene"),
            actorFolders: game.folders.entities.filter(f => f.type === "Actor"),
            playlists: game.playlists.entities.map(p => p.name),
        }

    }

    static get categories() {
        return [
            {
                key: "general", name: "MeisterSettings.general", icon: "fas fa-cogs", default: generalDefaultSettings
            },
            {
                key: "nsc-factory",
                name: "MeisterSettings.nsc",
                icon: "fas fa-user-friends",
                default: NscFactory.defaultSettings
            },
            {
                key: "scenes",
                name: "MeisterSettings.scenes",
                icon: "fas fa-map",
                default: SceneDirector.defaultSettings
            },
            {
                key: "locations",
                name: "MeisterSettings.locations",
                icon: "fas fa-map-signs",
                default: SceneParser.defaultSettings
            },
        ]
    }

    static async resetSettings() {
        for (let {key} of MeistertoolsSettings.categories) {
            await game.settings.set(moduleName, key, game.settings.settings.get(moduleName + '.' + key).default)
        }
        ui.notifications.info(game.i18n.localize("MeisterSettings.factoryReset"));
    }

    static registerSettings() {
        game.settings.registerMenu(moduleName, "config-ui", {
            name: "DSA5 Meistertools",
            label: "Einstellungen",
            hint: "Alle Einstellungen der DSA5 Meistertools",
            type: MeistertoolsSettings,
            restricted: true
        });
        for (const category of MeistertoolsSettings.categories)
            game.settings.register(moduleName, category.key, {
                default: category.default,
                scope: "world", config: false, type: Object
            });
    }


    _reloadSettings() {
        this.settings = {}
        for (let {key} of MeistertoolsSettings.categories)
            this.settings[key] = game.settings.get(moduleName, key)
    }


    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['meistertools'],
            popOut: true,
            width: 800,
            height: 820,
            resizable: true,
            closeOnSubmit: false,
            submitOnChange: false,
            submitOnClose: true,
            template: `modules/${moduleName}/templates/settings.hbs`,
            id: 'meistertools.settings',
            title: 'MeisterTools Settings',
            tabs: [{navSelector: ".tabs", contentSelector: ".content", initial: "general"}]
        });
    }

    async getData() {
        const data = await super.getData();
        mergeObject(data, {
            settingsCategories: MeistertoolsSettings.categories,
            ...this.selectOptions,
            ...this.settings,
        })
        return data;
    }

    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        if (game.user.isGM) {
            buttons.unshift({
                class: "undo",
                icon: `fas fa-undo`,
                onclick: async ev => this._reload()
            })
        }
        return buttons
    }

    async _reload() {
        this._reloadSettings()
        this.render(true)
    }

    async _reset() {
        await MeistertoolsSettings.resetSettings()
        await this._reload()
        this._callHook()
        AudioHelper.play({src: "sounds/notify.wav", volume: 0.8, loop: false}, false);
    }

    async _resetConfirm() {
        Dialog.confirm({
            title: "Reset Settings",
            content: "<p>Alle Einstellungen wieder zurücksetzen?</p>",
            yes: () => this._reset(),
            no: () => {
            },
            defaultYes: false
        });
    }

    async _magic(html) {
        let installedModules = this.settings.general.installedModules
        let updated = false
        for (const {category, key, defaultData, module} of SECRET_INGREDIENTS)
            if (html.find(`input[name=${key}]:checked`).length) {
                await game.settings.set(moduleName, category, defaultData)
                installedModules[module] = true
                updated = true
            }
        if (updated) {
            this.settings.general.installedModules = installedModules
            await game.settings.set(moduleName, "general", this.settings.general)
            await this._reload()
            this._callHook()
            ui.notifications.info(game.i18n.localize("MeisterSettings.Installed3rdParty"));
            AudioHelper.play({src: "sounds/drums.wav", volume: 0.8, loop: false}, false);
        }

    }

    async _magicConfirm() {
        const getMagicIngredients = () => {
            let result = ``
            const availableIngredients = []
            const installedIngredients = []
            const unavailableIngredients = []

            for (const ingredient of SECRET_INGREDIENTS) {
                if (!game.modules.get(ingredient.module)?.active) {
                    unavailableIngredients.push(ingredient)
                    continue
                }
                if (this.settings.general?.installedModules?.[ingredient.module])
                    installedIngredients.push(ingredient)
                else
                    availableIngredients.push(ingredient)
            }

            if (availableIngredients.length) {
                result += `<h3>Verfügbare Module</h3>`
                for (const {module, key, text} of availableIngredients)
                    result += `<div class="inner box" title="${module}" ><input class="switch" id="${key}" name="${key}" type="checkbox"/><label for="${key}"></label><label for="${key}">${text}</label></div>`
            }
            if (installedIngredients.length) {
                result += `<h3>Bereits für MeisterTools konfiguriert</h3>`
                for (const {module, key, text} of installedIngredients)
                    result += `<div class="inner box" title="${module}" ><input class="switch" id="${key}" type="checkbox" checked="checked" disabled/><label for="${key}"></label><label for="${key}">${text}</label></div>`
            }
            if (unavailableIngredients) {
                result += `<h3>Nicht verfügbar</h3>`
                for (const {key, text} of unavailableIngredients)
                    result += `<div class="inner box" title="Das benötigte Modul ist nicht installiert" ><input class="switch" disabled id="${key}" name="${key}" type="checkbox"/><label for="${key}"></label><label for="${key}">${text}</label></div>`
            }
            return result
        }
        Dialog.confirm({
            title: "MeisterTools Autokonfiguration",
            content: `<div class="meistertools"><h2>${game.i18n.localize("MeisterSettings.MagicHeader")}</h2><p>${game.i18n.localize("MeisterSettings.MagicText")}</p>${getMagicIngredients()}</div>`,
            yes: (html) => this._magic(html), no: () => {
            }, defaultYes: false
        });
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find("button[name=reset]").click(() => this._resetConfirm())
        html.find("button[name=magic]").click(() => this._magicConfirm())
        html.find("button[name=reload]").click(() => this._reload())
        html.find("a.update-regions").click(() => this._updateRegions(html))


        html.find("button.report-bug").click(async () => {
            window.open("https://github.com/tyr0mancer/dsa5-meistertools/issues", "_blank")
        })
        html.find("button.video-tutorial").click(async () => {
            window.open("https://www.youtube.com/channel/UC-8m_0C0dqzeUZdzRe1eF7w", "_blank")
        })
        html.find("button.open-wiki").click(async () => {
            window.open("https://github.com/tyr0mancer/dsa5-meistertools/wiki", "_blank")
        })

    }


    _updateObject(event, formData) {
        formData = Meistertools.expandObjectAndArray(formData)
        for (let {key: category} of MeistertoolsSettings.categories) {
            mergeObject(this.settings[category], formData[category])
            game.settings.set(moduleName, category, this.settings[category]);
        }
        this._callHook()
        this.close()
    }

    _callHook() {
        Hooks.call(moduleName + ".update-settings", this.settings)
    }


    async _updateRegions(html) {
        const collection = html.find("select[name='locations.locationsCollection']")[0].value
        const clearBiomes = html.find("input[name='locations.clearBiomes']")[0].checked || false
        const clearRegions = html.find("input[name='locations.clearRegions']")[0].checked || false
        const overwriteRegions = html.find("input[name='locations.overwriteRegions']")[0].checked || false
        const overwriteBiomes = html.find("input[name='locations.overwriteBiomes']")[0].checked || false


        let biomes = (clearBiomes) ? [] : this.settings.locations.biomes
        let regions = (clearRegions) ? [] : this.settings.locations.regions
        const pack = game.packs.get(collection)
        const content = await pack.getContent()
        for (const entry of content) {
            const key = entry.data.data.regionKey?.value
            if (!key) continue
            const category = entry.data.data.regionType?.value || "biome"
            const herbmod = entry.data.data.herbmod?.value || 0
            const biome = entry.data.data.defaultBiome?.value
            const {name, img} = entry
            if (category === "biome") {
                if (biomes.find(b => b.key === key)) {
                    if (!overwriteBiomes)
                        continue
                    biomes = await biomes.filter(b => b.key !== key)
                }
                biomes.push({name, key, img, herbmod})
            } else {
                if (regions.find(r => r.key === key)) {
                    if (!overwriteRegions)
                        continue
                    regions = await regions.filter(r => r.key !== key)
                }
                regions.push({name, key, category, img, herbmod, biome})
            }
        }

        this.settings.locations.biomes = duplicate(biomes)
        this.settings.locations.regions = duplicate(regions)
        await game.settings.set(moduleName, "locations", this.settings.locations)
        this.render()
    }
}
