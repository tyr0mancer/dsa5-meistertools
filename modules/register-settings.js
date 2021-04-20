import {moduleName} from "../dsa5-meistertools.js";
import {ManageScenes} from "./manage-scenes.js";
import {CreateNSC, getRuleset} from "./create-nsc.js";

export function registerSettings() {

    game.settings.registerMenu(moduleName, "config-ui", {
        name: "DSA5 Meistertools",
        label: "Einstellungen",
        hint: "Alle Einstellungen der DSA5 Meistertools",
        icon: "fas fa-eye",
        type: MeistertoolsConfig,
        restricted: true
    });

    game.settings.registerMenu(moduleName, "reset-settings", {
        name: "Initialize",
        label: "Initialisieren",
        type: InitializerForm,
        restricted: true
    });

    game.settings.register(moduleName, "settings", {
        name: "Settings",
        scope: "world",
        config: false,
        default: MeistertoolsConfig.DEFAULT_SETTINGS(),
        type: Object
    });


}

class InitializerForm extends FormApplication {

    render() {
        let content = `<h1>DSA5 Meistertools initialisieren</h1>`
        let buttons = {
            reset: {
                icon: '<i class="fa fa-check"></i>',
                label: 'zurück setzen',
                callback: html => {
                    game.settings.set(moduleName, 'settings', undefined)
                }
            },
            cancel: {
                icon: '<i class="fas fa-cancel"></i>',
                label: 'Abbruch',
                callback: html => {
                }
            }
        }

        if (game.modules.get('dsa5-homebrew')) {
            buttons['homebrew'] = {
                icon: '<i class="fa fa-check"></i>',
                label: 'Für dsa5-homebrew konfigurieren',
                callback: html => {
                    game.settings.set(moduleName, 'settings', {
                        "scenes": {
                            "activateDefault": true,
                            "updatePlaylist": true,
                            "defaultPlaylist": "",
                            "filterExisting": true,
                            "categories": [{
                                "name": "Theatre Of The Mind",
                                "folder": "TOTM",
                                "keywords": "Einkauf,Taverne,Tempel",
                                "packname": "dsa5-homebrew.scene-totm",
                                "addplayers": true,
                                "position": "untenlinks"
                            }, {
                                "name": "Battlemaps Wald",
                                "folder": "BM Wald",
                                "keywords": "mainroad,sideroad,well",
                                "packname": "dsa5-homebrew.bm-forest",
                                "addplayers": false,
                                "position": "center"
                            }]
                        },
                        "nsc": {
                            "closeAfterGeneration": true,
                            "tokenImageFolder": "modules/dsa5-homebrew/images/actors/random-npc",
                            "defaultOrigin": "mittellande",
                            "defaultCulture": "garethisch",
                            "defaultProfession": "",
                            "storedPatterns": [],
                            "genderOptions": [{"key": "random", "icon": "fas fa-dice", "name": "zufall"}, {
                                "key": "w",
                                "icon": "fas fa-venus",
                                "name": "weiblich"
                            }, {"key": "m", "icon": "fas fa-mars", "name": "männlich"}],
                            "professionPack": "dsa5-homebrew.actor-archetypen",
                            "folder": "Zufalls NPC"
                        }
                    })
                }
            }
            content += `<p>DSA5 Homebrew wurde gefunden und kann für Meistertools konfiguriert werden!</p>`
        }
        new Dialog({title: 'Meistertools initialisieren', content, buttons, default: 'cancel'}).render(true)
    }
}

class MeistertoolsConfig extends FormApplication {

    static DEFAULT_SETTINGS() {
        return {
            scenes: ManageScenes.getDefaultSettings(),
            nsc: CreateNSC.getDefaultSettings(),
        }
    }

    constructor(object, options) {
        super(object, options);
        game.settings.sheet.close();

        const scenePacks = game.packs
            .filter(p => p.metadata.entity === 'Scene')
            .map(p => p.metadata.package + '.' + p.metadata.name)

        const actorPacks = game.packs
            .filter(p => p.metadata.entity === 'Actor')
            .map(p => p.metadata.package + '.' + p.metadata.name)

        let origins = []
        let cultures = []
        for (let archetype of getRuleset().archetypes)
            for (let origin of archetype.origins) {
                origins.push({key: origin.key, name: origin.name})
                if (origin.cultures !== undefined)
                    cultures = cultures.concat(origin.cultures)
            }

        this.dataObject = mergeObject({
            scenePacks,
            actorPacks,
            origins,
            cultures,
            playlists: game.playlists
        }, game.settings.get(moduleName, 'settings') || MeistertoolsConfig.DEFAULT_SETTINGS());
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = moduleName + '-config';
        options.title = 'DSA5 Meistertools Einstellungen';
        options.template = `modules/${moduleName}/templates/meistertools-config.html`;
        options.tabs = [{navSelector: ".tabs", contentSelector: ".content", initial: "scenes"}]
        options.closeOnSubmit = true;
        options.width = 400
        options.resizable = true
        return options;
    }

    getData() {
        return this.dataObject
    }

    render(force, context = {}) {
        return super.render(force, context);
    }


    activateListeners(html) {
        super.activateListeners(html);
        html.find('.insert-element').click(event => this._insertArrayElement(event));
        html.find('.delete-element').click(event => this._deleteArrayElement(event));

        html.find('.add-scene-pack').click(ev => {
            ev.preventDefault();
            if (this.dataObject.scenes.categories === undefined)
                this.dataObject.scenes.categories = []
            this.dataObject.scenes.categories.push({})
            this.render()
        });

        html.find("button[name='change-token-image-folder']").click(event => this._changeTokenImageFolder());


        html.find('.delete-scene-pack').click(ev => {
            ev.preventDefault();
            this.dataObject.scenes.categories.splice(ev.target.value, 1);
            this.render();
        });
    }

    _deleteArrayElement(event) {
        event.preventDefault();
        console.log(event.target.name)
        console.log(event.target.value)
        const path = event.target.name.split('.')
        this.dataObject[path[0]][path[1]].splice(event.target.value, 1);
        this.render()
    }

    _insertArrayElement(event) {
        event.preventDefault();
        //console.log(event.target.name)
        const path = event.target.name.split('.')
        if (this.dataObject[path[0]][path[1]] === undefined)
            this.dataObject[path[0]][path[1]] = []
        this.dataObject[path[0]][path[1]].push({})
        this.render()
    }


    // todo there GOTTA be a better way to do this dynamically with handlebars data-binding. maybe someday Ill learn how
    _updateObject(event, formData) {
        let updatedSettings = game.settings.get(moduleName, 'settings')
        const settingMainKeys = Object.keys(updatedSettings)
        const formDataKeys = Object.keys(formData)
        for (let mainKey of settingMainKeys) {
            let arrayData = {}
            for (let formDataKey of formDataKeys) {
                if (formDataKey.startsWith(mainKey)) {
                    let dataKey = formDataKey.substr(mainKey.length + 1)
                    let dataValue = formData[formDataKey]
                    let arrayIndex = dataKey.indexOf('_')
                    if (arrayIndex !== -1) {
                        let arrayName = dataKey.substr(0, arrayIndex);
                        if (arrayData[arrayName] === undefined)
                            arrayData[arrayName] = []
                        arrayData[arrayName].push(dataKey.substr(arrayName.length + 1))
                        continue
                    }
                    updatedSettings[mainKey][dataKey] = dataValue
                }
            }
            const arrayKeys = Object.keys(arrayData)
            for (let arrayKey of arrayKeys) {
                let arr = []
                for (let arrayElem of arrayData[arrayKey]) {
                    const elem = formData[mainKey + '.' + arrayKey + "_" + arrayElem]
                    if (!Array.isArray(elem)) {
                        if (arr.length === 0) arr = [{}]
                        arr[0][arrayElem] = elem
                    } else {
                        if (arr.length === 0)
                            for (let index = 0; index < elem.length; index++)
                                arr.push({})
                        for (let index = 0; index < elem.length; index++)
                            arr[index][arrayElem] = elem[index]
                    }
                }
                updatedSettings[mainKey][arrayKey] = arr
            }
        }
        game.settings.set(moduleName, 'settings', updatedSettings);
    }

    _setTokenImageFolder(path) {
        this.dataObject.nsc.tokenImageFolder = path
        this.render()
    }

    async _changeTokenImageFolder() {
        await new FilePicker({
            type: "image",
            current: this.dataObject.nsc.tokenImageFolder,
            callback: (imagePath) => this._setTokenImageFolder(imagePath),
        }).browse(this.dataObject.nsc.tokenImageFolder, {wildcard: true});
    }
}
