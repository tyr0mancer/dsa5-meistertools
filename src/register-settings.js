import {moduleName} from "../meistertools.js";
import zutatenNsc from "../config/nsc-factory.config.zutaten.js";
import {MeistertoolsUtil} from "../meistertools-util.js";
import {NscFactory} from "./nsc-factory.js";
import {SceneParser} from "./scene-parser.js";
import {MeistertoolsRarity} from "./rarity.js";
import {Scenes} from "./scenes.js";

const settingsCategories = [
    {key: "nsc-factory", default: NscFactory.defaultSettings},
    {key: "scenes", default: Scenes.defaultSettings},
    {key: "locations", default: SceneParser.defaultSettings},
    {key: "general", default: {showSettings: true}},
]

export function registerSettings() {
    game.settings.registerMenu(moduleName, "config-ui", {
        name: "DSA5 Meistertools",
        label: "Einstellungen",
        hint: "Alle Einstellungen der DSA5 Meistertools",
        icon: "fas fa-eye",
        type: MeistertoolsSettings,
        restricted: true
    });
    for (const category of settingsCategories)
        game.settings.register(moduleName, category.key, {
            default: category.default,
            scope: "world", config: false, type: Object
        });
}


export class MeistertoolsSettings extends FormApplication {
    isOpen = false

    toggle() {
        if (this.isOpen)
            this.close()
        else
            this.render(true)
    }

    close() {
        this.isOpen = false
        super.close()
    }

    render(force) {
        this.isOpen = true
        super.render(force)
    }

    constructor(initialTab = 'nsc') {
        super();
        this.initialTab = initialTab
        this.settings = {}
        for (let {key} of settingsCategories) {
            this.settings[key] = game.settings.get(moduleName, key)
        }

        this.selectOptions = {
            actorPacks: game.packs.filter(p => p.metadata.entity === 'Actor'),
            scenePacks: game.packs.filter(p => p.metadata.entity === 'Scene'),
            sceneFolders: game.folders.entities.filter(f => f.type === "Scene"),
            baseActors: [],
            playlists: game.playlists.entities.map(p => p.name),
        }

        this.zutatenInstalled = (game.modules.get("dsa5-meistertools-zutaten")?.active)
    }

    async _setSelectOptions() {
        const pack = game.packs.find(p => p.collection === this.settings["nsc-factory"]?.baseActorCollection)
        if (!pack?.index?.length)
            await pack?.getIndex()
        this.selectOptions.baseActors = pack?.index || []
    }


    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['meistertools'],
            popOut: true,
            width: 1000,
            height: 800,
            resizable: true,
            closeOnSubmit: false,
            submitOnChange: false,
            submitOnClose: false,
            template: `modules/${moduleName}/templates/settings.hbs`,
            id: 'meistertools.settings',
            title: 'MeisterTools Settings',
            tabs: [{navSelector: ".tabs", contentSelector: ".content", initial: "general"}]
        });
    }


    async getData() {
        await this._setSelectOptions()
        return {
            selectOptions: this.selectOptions,
            ...this.settings,
            zutatenInstalled: this.zutatenInstalled
        }
    }


    activateListeners(html) {
        super.activateListeners(html);
        MeistertoolsUtil.addDefaultListeners(html);
        html.find("button.open-app").click((event) => {
            const appName = $(event.currentTarget).attr("name")
            if (appName === 'scene-parser') {
                new SceneParser().render(true)
                this.close()
            }
            if (appName === 'entity-tagger') {
                new MeistertoolsRarity().render(true)
                this.close()
            }
        });
        html.find("button[type=reset]").click((event) => {
            const category = $(event.currentTarget).attr("data-category")
            this.settings[category] = game.settings.get(moduleName, category)
            this.render()
        });
        html.find("button[name=restore-settings]").click(async (event) => {
            const category = $(event.currentTarget).attr("data-category")
            await game.settings.set(moduleName, category, game.settings.settings.get(moduleName + '.' + category).default)
            this.settings[category] = await game.settings.get(moduleName, category)
            this.render()
        });
        html.find("button[name=install-zutaten]").click(async (event) => {
            const category = $(event.currentTarget).attr("data-category")
            if (category === "nsc-factory") {
                await game.settings.set(moduleName, category, zutatenNsc)
                this.settings[category] = await game.settings.get(moduleName, category)
                this.render()
            }
        });


        html.find("button.insert-entry").click(event => {
            const path = $(event.currentTarget).attr("data-path")?.split('.')
            if (!path) return
            if (!this.settings[path[0]][path[1]])
                this.settings[path[0]][path[1]] = []
            this.settings[path[0]][path[1]].push({})
            this.render()
        })

        html.find("button.remove-entry").click(event => {
            const index = $(event.currentTarget).attr("data-index")
            const path = $(event.currentTarget).attr("data-path")?.split('.')
            if (!path || !this.settings[path[0]][path[1]]) return
            this.settings[path[0]][path[1]].splice(index, 1)
            this.render()
        })
    }


    _updateObject(event, formData) {
        formData = MeistertoolsUtil.expandObjectAndArray(formData)
        for (let {key: category} of settingsCategories) {
            if (!formData[category]) continue
            mergeObject(this.settings[category], formData[category])
            game.settings.set(moduleName, category, this.settings[category]);
        }
        Hooks.call(moduleName + ".update-settings", this.settings)
    }

}
