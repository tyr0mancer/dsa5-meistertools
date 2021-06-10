import {MeistertoolsUtil, moduleName} from "../meistertools.js";
import {MeisterApplication} from "../util/meister-application.js";

import {SceneDirector} from "./scene-director.mjs";

import {NscFactory} from "../src/nsc-factory.js";
import {SceneParser} from "../src/scene-parser.js";
import {defaultSettings, SECRET_INGREDIENTS} from "../config/general.config.js";


export class MeistertoolsSettings extends MeisterApplication {
    constructor() {
        super();
        this._reloadSettings()

        this.selectOptions = {
            actorPacks: game.packs.filter(p => p.metadata.entity === 'Actor'),
            scenePacks: game.packs.filter(p => p.metadata.entity === 'Scene'),
            sceneFolders: game.folders.entities.filter(f => f.type === "Scene"),
            actorFolders: game.folders.entities.filter(f => f.type === "Actor"),
            playlists: game.playlists.entities.map(p => p.name),
        }

    }

    static get categories() {
        return [
            {
                key: "general", name: "MeisterSettings.general", icon: "fas fa-cogs", default: defaultSettings
            },
            {
                key: "nsc-factory",
                name: "MeisterSettings.nsc",
                icon: "fas fa-user-friends",
                default: NscFactory.defaultSettings
            },
            {
                key: "scenes", name: "MeisterSettings.scenes", icon: "fas fa-map", default: SceneDirector.defaultSettings
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
        Hooks.call(moduleName + ".update-settings", this.settings)
    }

    async _resetConfirm() {
        Dialog.confirm({
            title: "Reset Settings",
            content: "<p>Alle Einstellungen zurück setzen?</p>",
            yes: () => this._reset(),
            no: () => console.log("you never should have come here"),
            defaultYes: false
        });
    }

    async _magic(html) {
        for (const {category, key, defaultData} of SECRET_INGREDIENTS)
            if (html.find(`input[name=${key}]:checked`).length)
                await game.settings.set(moduleName, category, defaultData)
        await this._reload()
        Hooks.call(moduleName + ".update-settings", this.settings)
    }

    async _magicConfirm() {


        const getMagicIngredients = () => {
            let result = ``
            for (const {module, key, text} of SECRET_INGREDIENTS) {
                const [disabled, title] = game.modules.get(module)?.active ? ["", "Modul: " + module] : ["disabled", "Das benötigte Modul ist nicht installiert"]
                result += `<div class="inner box" title="${title}" ><input class="switch" ${disabled} id="${key}" name="${key}" type="checkbox"/><label for="${key}"></label><label for="${key}">${text}</label></div>`
            }
            return result
        }

        Dialog.confirm({
            title: "MeisterTools Autokonfiguration",
            content: `<div class="meistertools">
                <h2>Module wählen</h2>
                <p>Für welche der folgenden Dritt-Module sollen die MeisterTools Einstellungen angepasst gesetzt werden?</p>
                ${getMagicIngredients()}                
            </div>`,
            yes: (html) => this._magic(html),
            no: () => console.log("you never should have come here"),
            defaultYes: false
        });
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find("button[name=reset]").click(() => this._resetConfirm())
        html.find("button[name=magic]").click(() => this._magicConfirm())
        html.find("button[name=reload]").click(() => this._reload())


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
        formData = MeistertoolsUtil.expandObjectAndArray(formData)
        for (let {key: category} of MeistertoolsSettings.categories) {
            mergeObject(this.settings[category], formData[category])
            game.settings.set(moduleName, category, this.settings[category]);
        }
        Hooks.call(moduleName + ".update-settings", this.settings)
        this.close()
    }


}
