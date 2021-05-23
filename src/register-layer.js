import {NscFactory} from "./nsc-factory.js";
import {MeistertoolsSettings} from "./register-settings.js";
import {MeistertoolsLocator} from "./locator.js";
import {PlayersView} from "./players-view.js";
import {Scenes} from "./scenes.js";
import {Jukebox} from "./jukebox.js";
import {Nightwatch} from "./nightwatch.js";

export function registerControlButtons(controls) {
    const tools = [
        {
            name: "nsc-factory",
            title: 'Figur in Szene',
            icon: "fas fa-user-plus",
            button: true,
            onClick: () => new NscFactory().render(true)
        },

        {
            name: "scenes",
            title: 'Szenenwechsel',
            icon: "fas fa-film",
            button: true,
            onClick: () => new Scenes().render(true)
        },


        {
            name: "locator",
            title: 'Aktuellen Ort festlegen',
            icon: "fas fa-street-view",
            button: true,
            onClick: () => new MeistertoolsLocator().render(true)
        },
        {
            name: "nightwatch",
            title: 'Nachtlager',
            icon: "fas fa-campground",
            button: true,
            onClick: () => new Nightwatch().render(true)
        },
        {
            name: "jukebox",
            title: "Musik",
            icon: "fas fa-volume-up",
            button: true,
            onClick: () => new Jukebox().render(true)
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
        */
    ]


    if (game.user.isGM)
        controls.push({
            name: "dsa5-meistertools",
            title: "DSA MeisterTools",
            icon: "fas fa-eye",
            layer: "MeistertoolsLayer",
            tools
        });


    const tokenPanel = controls.find(c => (c.name === "token"))
    tokenPanel['tools'].push({
        name: "players-view",
        title: 'DSA MeisterTools',
        icon: "fas fa-eye",
        button: true,
        onClick: () => new PlayersView().render(true)
    })


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


