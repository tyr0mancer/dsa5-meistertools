import Jukebox from "./modules/jukebox.js";

import {ManageScenes} from './modules/manage-scenes.js'
import {Dsa5Nightwatch} from './modules/nightwatch.js'

import {createNSC} from './modules/create-nsc.js'
import {playerWhisper} from './modules/player-whisper.js'

import {registerSettings} from './modules/register-settings.js'

export const moduleName = "dsa5-meistertools";


/**
 * remembers playlist Name in flags and assigns new playlist in case the old playlist was removed
 * and replaced with a playlist with the same name
 */
Hooks.on('updateScene', (scene, data) => {
    if (!game.user.isGM)
        return;

    const settings = game.settings.get(moduleName, 'settings')
    if (!settings.scenes.updatePlaylist)
        return

    if (hasProperty(data, 'active')) {
        console.log(scene.name + ' was activated ')
        if (!scene.playlist) {
            let playlistName = scene.getFlag(moduleName, 'playlistName')
            if (!playlistName && settings.scenes.defaultPlaylist !== '') {
                playlistName = settings.scenes.defaultPlaylist
            }

            if (playlistName) {
                console.log(moduleName + ' :: scene has no playlist, update from getFlag() ', playlistName)
                const playlist = game.playlists.find(p => p.name === playlistName)
                if (playlist) {
                    console.log(playlist)
                    scene.update({playlist: playlist.data._id})
                }
            }
        }
    }

    if (hasProperty(data, 'playlist')) {
        const playlistName = scene.playlist?.data?.name
        if (playlistName) {
            console.log(moduleName + ' :: playlist was updated, setFlag() ', playlistName)
            scene.setFlag(moduleName, 'playlistName', playlistName)
        } else {
            console.log(moduleName + ' :: playlist was deleted, unsetFlag() ')
            scene.unsetFlag(moduleName, 'playlistName')
        }
    }
});


/**
 * Add Entries to the SceneControl
 */
Hooks.on("getSceneControlButtons", (controls) => {
    pushControlButtons(controls)
});


/**
 * Registers settings
 */
Hooks.once('init', () => {
    console.log("Initializing DSA5 MeisterTools")
    registerLayer()
    registerSettings()
    //registerHandlebarHelpers()

    // todo organise Handlebars.helper
    Handlebars.registerHelper('each_when', function (list, k, v, opts) {
        let i, result = '';
        for (i = 0; i < list.length; ++i)
            if (list[i][k].includes(v))
                result = result + opts.fn(list[i]);
        return result;
    });
    Handlebars.registerHelper('stringify', function (obj, opts) {
        return JSON.stringify(obj, null, 2)
    });
    Handlebars.registerHelper('ifeq', function (a, b, options) {
        if (a == b) {
            return options.fn(this);
        }
        return options.inverse(this);
    });
    Handlebars.registerHelper('checked_radio', function (a, b) {
        return (a === b) ? 'checked' : ''
    });
    Handlebars.registerHelper('checked_property', function (obj, property) {
        return (obj !== undefined && obj[property]) ? 'checked' : ''
    });


    Handlebars.registerHelper('active', function (a, b) {
        return (a === b) ? 'active' : ''
    });

    Handlebars.registerHelper('nactive', function (a, b) {
        return (a !== undefined && a !== '') ? 'active' : ''
    });

    Handlebars.registerHelper('ifIsProperty', function (obj, property, value) {
        return (obj !== undefined && obj[property]) ? value : ''
    });

});


function registerLayer() {
    const layers = mergeObject(Canvas.layers, {
        homebrew: MeistertoolsLayer
    });
    Object.defineProperty(Canvas, 'layers', {
        get: function () {
            return layers
        }
    });
}

function pushControlButtons(controls) {

    let tools = []
    if (game.user.isGM)
        tools = [
            {
                name: "manage-scenes",
                title: 'Szenen verwalten',
                icon: "fas fa-film",
                visible: true,
                button: true,
                onClick: () => new ManageScenes().render(true)
            },
            {
                name: "NSCGenerator",
                title: 'NSC Generator',
                icon: "fas fa-user-plus",
                visible: true,
                button: true,
                onClick: () => createNSC(true)
            },
            {
                name: "jukebox",
                title: "Jukebox",
                icon: "fas fa-volume-up",
                visible: true,
                button: true,
                onClick: () => new Jukebox().render(true)
            },
            {
                name: "nightwatch",
                title: 'Nachtlager',
                icon: "fas fa-campground",
                visible: true,
                button: true,
                onClick: () => new Dsa5Nightwatch().render(true)
            },

            /*
                        {
                            name: "randomEncounter",
                            title: game.i18n.localize(moduleName + ".randomEncounter"),
                            icon: "fas fa-dice-d20",
                            visible: true,
                            button: true,
                            onClick: () => randomEncounter()
                        },
                        {
                            name: "library",
                            title: game.i18n.localize(moduleName + ".randomLibrary"),
                            icon: "fas fa-book",
                            visible: true,
                            button: true,
                            onClick: () => randomLibrary()
                        },
                        {
                            name: "beast",
                            title: game.i18n.localize(moduleName + ".beastGenerator"),
                            icon: "fas fa-spider",
                            visible: true,
                            button: true,
                            onClick: () => createBeast()
                        }
            */

        ]

    /*

    //falls herbarium als modul
    tools = tools.concat([
        {
            name: "plants",
            title: 'Kräutersuche',
            icon: "fas fa-seedling",
            visible: true,
            button: true,
            onClick: () => huntingHerbs()
        },
        {
            name: "hunting",
            title: 'Jagd',
            icon: "fas fa-paw",
            visible: true,
            button: true,
            onClick: () => huntingGame()
        },
    ])
    */

    tools.push({
        name: "whisper",
        title: 'Flüstern',
        icon: "fas fa-user-secret",
        visible: true,
        button: true,
        onClick: () => playerWhisper()
    })

    // tools.push({ name: "playground", title: 'playground', icon: "fas fa-vial", visible: true, button: true, onClick: () => playground() })

    controls.push({
        name: "dsa5-meistertools",
        title: "DSA MeisterTools",
        icon: "fas fa-eye",
        layer: "MeistertoolsLayer",
        tools
    });
}


class MeistertoolsLayer extends PlaceablesLayer {
    constructor() {
        super();
    }

    static get layerOptions() {
        return mergeObject(super.layerOptions, {
            canDragCreate: false,
            objectClass: Note,
            sheetClass: NoteConfig
        });
    }

    activate() {
        CanvasLayer.prototype.activate.apply(this);
        return this;
    }

    deactivate() {
        CanvasLayer.prototype.deactivate.apply(this);
        return this;
    }

    async draw() {
        super.draw();
    }
}


