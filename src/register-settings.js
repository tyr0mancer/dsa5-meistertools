import {moduleName} from "../meistertools.js";
import {MeistertoolsUtil} from "../meistertools-util.js";
import {NscFactory} from "./nsc-factory.js";
import {SceneParser} from "./scene-parser.js";
import {EntityTagger} from "./entity-tagger.js";


export function registerSettings() {
    game.settings.registerMenu(moduleName, "config-ui", {
        name: "DSA5 Meistertools",
        label: "Einstellungen",
        hint: "Alle Einstellungen der DSA5 Meistertools",
        icon: "fas fa-eye",
        type: MeistertoolsSettings,
        restricted: true
    });
    game.settings.register(moduleName, "nsc-factory", {
        scope: "world",
        config: false,
        type: Object,
        default: NscFactory.defaultSettings
    });
    game.settings.register(moduleName, "rarity", {
        scope: "world",
        config: false,
        type: Object,
        default: {}
    });
    game.settings.register(moduleName, "locations", {
        scope: "world",
        config: false,
        type: Object,
        default: SceneParser.defaultSettings
    });
}


export class MeistertoolsSettings extends FormApplication {
    constructor(initialTab = 'nsc') {
        super();
        this.settingsCategories = ["nsc-factory", "rarity", "locations"]
        this.initialTab = initialTab
        this.settings = {}
        for (let category of this.settingsCategories)
            this.settings[category] = game.settings.get(moduleName, category)
        this.selectOptions = {
            actorPacks: game.packs.filter(p => p.metadata.entity === 'Actor'),
            scenePacks: game.packs.filter(p => p.metadata.entity === 'Scene'),
            baseActors: [],
            playlists: game.playlists,
        }

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
            width: 800,
            resizable: true,
            template: `modules/${moduleName}/templates/settings.hbs`,
            id: 'meistertools.settings',
            title: 'MeisterTools Settings',
            tabs: [{navSelector: ".tabs", contentSelector: ".content", initial: "locations"}]
        });
    }


    async getData() {
        await this._setSelectOptions()
        return {
            selectOptions: this.selectOptions,
            ...this.settings
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
                new EntityTagger().render(true)
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
        for (let category of this.settingsCategories) {
            if (!formData[category]) continue
            //this.settings[category] = game.settings.get(moduleName, category)
            mergeObject(this.settings[category], formData[category])
            game.settings.set(moduleName, category, this.settings[category]);
        }
        Hooks.call(moduleName + ".update-settings", this.settings)
    }

}
