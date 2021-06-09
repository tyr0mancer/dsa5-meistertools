import {NscFactory} from "./nsc-factory.js";
import {MeistertoolsLocator} from "./locator.js";
import {PlayersView} from "./players-view.js";
import {Scenes} from "./scenes.js";
import {RequestRoll} from "./request-roll.js";
import {Jukebox} from "./jukebox.js";

import {moduleName} from "../meistertools.js";
import {SceneParser} from "./scene-parser.js";
import {MeistertoolsRarity} from "./rarity.js";
import {MeistertoolsSettings} from "../modules/settings.mjs";


export function registerControlButtons(controls) {
    const _SceneDirector = new Scenes()
    const _NscFactory = new NscFactory()
    const _RequestRoll = new RequestRoll()
    const _Jukebox = new Jukebox()
    const _PlayersView = new PlayersView()
    const _Locator = new MeistertoolsLocator()
    const _Settings = new MeistertoolsSettings()
    const _MapMaker = new SceneParser()
    const _EntityManager = new MeistertoolsRarity()

    const tools = [
        {
            name: "scenes",
            title: 'Szenenwechsel',
            icon: "fas fa-map",
            visible: true,
            button: true,
            onClick: () => _SceneDirector.toggle()
        },
        {
            name: "nsc-factory",
            title: 'NSC Fabrik',
            icon: "fas fa-user-friends",
            button: true,
            onClick: () => _NscFactory.toggle()
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
            onClick: () => _RequestRoll.toggle()
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
            onClick: () => _Locator.toggle()
        },
        {
            name: "music",
            title: 'Musik',
            icon: "fas fa-music",
            button: true,
            onClick: () => _Jukebox.toggle()
        },
    ]

    const {showSettings, showMapMaker, topMenu, showEntityTagger} = game.settings.get(moduleName, 'general')
    if (showMapMaker)
        tools.push({
            name: "mapmaker",
            title: 'Map Maker',
            icon: "fas fa-drafting-compass",
            button: true,
            onClick: () => _MapMaker.toggle()
        })
    if (showEntityTagger)
        tools.push({
            name: "entity-tagger",
            title: 'Entity Manager',
            icon: "fas fa-tags",
            button: true,
            onClick: () => _EntityManager.toggle()
        })
    if (showSettings)
        tools.push({
            name: "settings",
            title: 'Settings',
            icon: "fas fa-cog",
            button: true,
            onClick: () => _Settings.toggle()
        })

    if (game.user.isGM) {
        const meistertoolsControls = {
            name: "meistertools",
            title: "MeisterTools",
            icon: "fas fa-dungeon",
            layer: "meistertools",
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
        onClick: () => _PlayersView.toggle()
    })


}

export function registerLayer() {
    let canvasLayers = Canvas.layers;
    canvasLayers.meistertools = MeistertoolsLayer;
    Object.defineProperty(Canvas, 'layers', {
        get: function () {
            return canvasLayers
        }
    })
}

class MeistertoolsLayer extends CanvasLayer {
    constructor() {
        super();
        this.options = this.constructor.layerOptions;
    }

    /** @inheritdoc */
    static get layerOptions() {
        return foundry.utils.mergeObject(super.layerOptions, {
            name: "meistertools",
            canDragCreate: false,
            controllableObjects: true,
            rotatableObjects: true,
            zIndex: 200,
        });
    }

}
