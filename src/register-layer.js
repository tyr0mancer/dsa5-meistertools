import {NscFactory} from "./nsc-factory.js";
import {MeistertoolsSettings} from "./register-settings.js";
import {MeistertoolsLocator} from "./locator.js";
import {PlayersView} from "./players-view.js";
import {Scenes} from "./scenes.js";
import {RequestRoll} from "./request-roll.js";
import {RandomTables} from "./random-tables.js";
import {ManageProps} from "./props.js";
import {FightSimulator} from "./fight-simulator.js";
import {Jukebox} from "./jukebox.js";

export function registerControlButtons(controls) {
    const tools = [
        {
            name: "scenes",
            title: 'Szenenwechsel',
            icon: "fas fa-map",
            button: true,
            onClick: () => new Scenes().render(true)
        },
        {
            name: "nsc-factory",
            title: 'NSC Fabrik',
            icon: "fas fa-user-friends",
            button: true,
            onClick: () => new NscFactory().render(true)
        },
        {
            name: "beasts",
            title: 'Kampfsimulator',
            icon: "fas fa-biohazard",
            button: true,
            onClick: () => new FightSimulator().render(true)
        },
        {
            name: "request-roll",
            title: 'Fokus-Regeln',
            icon: "fas fa-book",
            button: true,
            onClick: () => new RequestRoll().render(true)
        },
        {
            name: "random",
            title: "Zufallstabellen",
            icon: "fas fa-th-list",
            button: true,
            onClick: () => new RandomTables().render(true)
        },
        {
            name: "props",
            title: "Camp",
            icon: "fas fa-campground",
            button: true,
            onClick: () => new ManageProps().render(true)
        },
        {
            name: "locator",
            title: 'Aktuellen Ort festlegen',
            icon: "fas fa-map-signs",
            button: true,
            onClick: () => new MeistertoolsLocator().render(true)
        },
        {
            name: "music",
            title: 'Musik',
            icon: "fas fa-music",
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
    ]


    if (game.user.isGM)
        controls.unshift({
            name: "meistertools",
            title: "MeisterTools",
            icon: "fas fa-dungeon",
            layer: "MeistertoolsLayer",
            tools
        });


    controls.find(c => (c.name === "token"))?.tools?.push({
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


