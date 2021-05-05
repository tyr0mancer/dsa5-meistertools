import {moduleName} from "../meistertools.js";
import {ManageScenes} from "./manage-scenes.js";
import {CreateNSC, getRuleset} from "./create-nsc.js";


export async function registerSettings() {
    await game.settings.registerMenu(moduleName, "config-ui", {
        name: "DSA5 Meistertools",
        label: "Einstellungen",
        hint: "Alle Einstellungen der DSA5 Meistertools",
        icon: "fas fa-eye",
        type: MeistertoolsConfig,
        restricted: true
    });
    /*
        await game.settings.registerMenu(moduleName, "reset-settings", {
            name: "Initialize",
            label: "Initialisieren",
            type: InitializerForm,
            restricted: true
        });
    */

    await game.settings.register(moduleName, "settings", {
        scope: "world",
        config: false,
        type: Object,
        default: MeistertoolsConfig.defaultSettings
    });
}


class MeistertoolsConfig extends FormApplication {
    constructor() {
        super();
        //game.settings.sheet.close();
        this.settings = game.settings.get(moduleName, 'settings') || {}

        // todo use reducer
        let origins = []
        let cultures = []
        for (let archetype of getRuleset().archetypes)
            for (let origin of archetype.origins) {
                origins.push({key: origin.key, name: origin.name})
                if (origin.cultures !== undefined)
                    cultures = cultures.concat(origin.cultures)
            }

        this.selectOptions = {
            actors: game.packs
                .filter(p => p.metadata.entity === 'Actor')
                .map(p => {
                    return {
                        name: p.metadata.label,
                        packname: p.collection
                    }
                }),
            scenes: game.packs
                .filter(p => p.metadata.entity === 'Scene')
                .map(p => {
                    return {
                        name: p.metadata.label,
                        packname: p.collection
                    }
                }),
            playlists: game.playlists,
            genderIcons: ["fas fa-dice", "fas fa-venus", "fas fa-mars"],
            origins, cultures,
        }


    }

    async setProfessionOptions() {
        const pack = game.packs.find(p => p.collection === this.settings.nsc.professionPack)
        await pack.getIndex()
        this.professions = pack.index
    }


    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['form'],
            popOut: true,
            width: 800,
            resizable: true,
            template: `modules/${moduleName}/templates/settings.html`,
            id: 'meistertools.settings',
            title: 'Meistertools Settings',
            tabs: [{navSelector: ".tabs", contentSelector: ".content", initial: "scenes"}]
        });
    }


    async getData() {
        await this.setProfessionOptions()
        this.selectOptions.professions = this.professions
        return {
            selectOptions: this.selectOptions,
            settings: this.settings
        };
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find("nav.help-icon").click((event) => $('.help-info.help-' + $(event.currentTarget).attr("data-help")).toggle())
        html.find("button[name='reset-settings']").click(() => {
            this.settings = game.settings.get(moduleName, 'settings')
            this.render()
        });

        html.find("a[name='remove-pack']").click(() => {
            this.settings.scenes.categories.splice($(event.currentTarget).attr("data-index"), 1);
            this.render()
        })
        html.find("a[name='add-pack']").click(() => {
            this.settings.scenes.categories.push({})
            this.render()
        })
        html.find("a[name='add-gender']").click(() => {
            this.settings.nsc.genderOptions.push({})
            this.render()
        })

        html.find("button[name='btn_del-gender']").click((event) => {
            this.settings.nsc.genderOptions.splice($(event.currentTarget).attr("data-gender-index"), 1);
            this.render()
        })

        html.find("button[name='change-token-image-folder']").click(() => new FilePicker({
            type: "image",
            current: this.settings.nsc.tokenImageFolder,
            callback: (imagePath) => {
                this.settings.nsc.tokenImageFolder = imagePath
                this.render()
            },
        }).browse(this.settings.nsc.tokenImageFolder, {wildcard: true}))

    }


    _updateObject(event, formData) {
        let settings = game.settings.get(moduleName, 'settings')
        const data = expandObjectRev2(formData)
        mergeObject(settings, data.settings)

        console.clear()
        console.log('%c' + JSON.stringify(settings), "font-size:1.5em;background-color:lightblue")
        game.settings.set(moduleName, 'settings', settings);
        this.render()
    }


    static get defaultSettings() {
        return {
            scenes: ManageScenes.getDefaultSettings(),
            nsc: CreateNSC.getDefaultSettings(),
        }
    }
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
                                "packname": "dsa5-homebrew.scene-bm-forest",
                                "addplayers": false,
                                "position": "center",
                                "thumbFolder": "modules/dsa5-homebrew/images/battlemaps/forest-bm/thumbs",
                                "templateId": "gk4KBgTv0KjqkCKf"
                            }]
                        },
                        "nsc": {
                            "closeAfterGeneration": true,
                            "tokenImageFolder": "modules/dsa5-homebrew/images/actors/random-npc",
                            "defaultOrigin": "mittellande",
                            "defaultCulture": "garethisch",
                            "defaultProfession": "AENj6jLndvawKiHG",
                            "defaultProfessionName": "Bürger",
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


// todo move to util
function expandObjectRev2(obj) {
    const expanded = {};
    console.clear()
    for (let [k, v] of Object.entries(obj)) {
        setPropertyRev2(expanded, k, v);
    }
    return expanded;
}

function setPropertyRev2(object, key, value) {
    let target = object;
    let changed = false;
    // Convert the key to an object reference if it contains dot notation
    if (key.indexOf('.') !== -1) {
        let parts = key.split('.');
        key = parts.pop();
        target = parts.reduce((obj, currentKey) => {
            let match = currentKey.match(/^(.*)\[(.*)\]$/)
            if (match) {
                const property = match[1]
                if (!obj.hasOwnProperty(property) || !Array.isArray(obj[property])) obj[property] = [];

                let index = parseInt(match[2])
                if (isNaN(index) || index < 0) {
                    index = obj[property].length
                }

                while (obj[property].length <= index) {
                    obj[property].push({})
                }
                return obj[property][index];
            } else {
                if (!obj.hasOwnProperty(currentKey)) obj[currentKey] = {};
                return obj[currentKey];
            }
        }, object);
    }
    // Update the target
    if (target[key] !== value) {
        changed = true;
        target[key] = value;
    }
    // Return changed status
    return changed;
}
