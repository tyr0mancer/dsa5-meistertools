import {NscFactory} from "./nsc-factory.js";
import {MeistertoolsSettings} from "./register-settings.js";
import {MeistertoolsLocator} from "./locator.js";
import {PlayersView} from "./players-view.js";

export function registerControlButtons(controls) {
    let tools = []
    if (game.user.isGM)
        tools = [
            {
                name: "nsc-factory",
                title: 'NSC',
                icon: "fas fa-user-plus",
                button: true,
                onClick: () => new NscFactory().render(true)
            },

            {
                name: "locator",
                title: 'Locator',
                icon: "fas fa-street-view",
                button: true,
                onClick: () => new MeistertoolsLocator().render(true)
            },

            {
                name: "settings",
                title: 'Settings',
                icon: "fas fa-cog",
                button: true,
                onClick: () => new MeistertoolsSettings().render(true)
            },


            /*
            {
                name: "entity-tagger",
                title: 'Entity Tagger',
                icon: "fas fa-tags",
                button: true,
                onClick: () => new MeistertoolsRarity().render(true)
            },

            {
                name: "manage-scenes",
                title: 'Szenen verwalten',
                icon: "fas fa-film",
                visible: true,
                button: true,
                onClick: () => new ManageScenes().render(true)
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
            }
            */
        ]

    tools.push({
        name: "players-view",
        title: 'Tafelrunde',
        icon: "fab fa-fort-awesome-alt",
        button: true,
        onClick: () => new PlayersView().render(true)
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


export function registerLayer() {
    const layers = mergeObject(Canvas.layers, {
        meistertools: MeistertoolsLayer
    });
    Object.defineProperty(Canvas, 'layers', {
        get: function () {
            return layers
        }
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


