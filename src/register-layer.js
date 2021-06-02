import {NscFactory} from "./nsc-factory.js";
import {MeistertoolsSettings} from "./register-settings.js";
import {MeistertoolsLocator} from "./locator.js";
import {PlayersView} from "./players-view.js";
import {Scenes} from "./scenes.js";
import {RequestRoll} from "./request-roll.js";
import {Jukebox} from "./jukebox.js";

/*
import {ManageProps} from "./props.js";
import {FightSimulator} from "./fight-simulator.js";
import {RandomTables} from "./random-tables.js";
*/

import {moduleName} from "../meistertools.js";

export function registerControlButtons(controls) {
    const tools = [
        {
            name: "scenes",
            title: 'Szenenwechsel',
            icon: "fas fa-map",
            visible: true,
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
        /*
        {
            name: "beasts",
            title: 'Kampfsimulator',
            icon: "fas fa-biohazard",
            button: true,
            onClick: () => new FightSimulator().render(true)
        },
        */
        {
            name: "request-roll",
            title: 'Regelbuch (beta)',
            icon: "fas fa-book",
            button: true,
            onClick: () => new RequestRoll().render(true)
        },
        /*
        {
            name: "random",
            title: "Zufallstabellen",
            icon: "fas fa-th-list",
            button: true,
            onClick: () => new RandomTables().render(true)
        },
        */
        /*
        {
            name: "props",
            title: "Camp",
            icon: "fas fa-campground",
            button: true,
            onClick: () => new ManageProps().render(true)
        },
        */
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
    ]

    const {showSettings, topMenu} = game.settings.get(moduleName, 'general')
    if (showSettings)
        tools.push({
            name: "settings",
            title: 'Settings',
            icon: "fas fa-cog",
            button: true,
            onClick: () => new MeistertoolsSettings().render(true)
        })
    if (game.user.isGM) {
        const meistertoolsControls = {
            name: "meistertools",
            title: "MeisterTools",
            icon: "fas fa-dungeon",
            layer: "controls", //(game.data.version.startsWith("0.7.")) ? "MeistertoolsLayer" : "meistertools",
            tools
        }
        if (topMenu)
            controls.unshift(meistertoolsControls);
        else
            controls.push(meistertoolsControls);
    }


    controls.find(c => (c.name === "token"))?.tools?.push({
        name: "players-view",
        title: 'DSA MeisterTools',
        icon: "fas fa-eye",
        button: true,
        onClick: () => new PlayersView().render(true)
    })


}

/*

export function registerLayer() {
    let canvasLayers = Canvas.layers;
    canvasLayers.meistertools = MeistertoolsLayer;
    Object.defineProperty(Canvas, 'layers', {
        get: function () {
            return canvasLayers
        }
    })
}
*/

class MeistertoolsLayer extends ControlsLayer {
    constructor() {
        super();
    }

    static get layerOptions() {
        return mergeObject(super.layerOptions, { zIndex: 1000 });
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


