import MeistertoolsControls from "./util/meistertools-controls.js"

import MeistertoolsSettings from "./modules/settings.js";
import SceneDirector from "./modules/scene-director.js";
import NscFactory from "./modules/nsc-factory.js";
import RuleBook from "./modules/rulebook.js";

import SceneParser from "./src/scene-parser.js";
import {MeistertoolsRarity} from "./src/rarity.js";
import {MeistertoolsLocator} from "./src/locator.js";

import {registerHandlebarHelper} from "./util/register-handlebar-helper.js";
import MeistertoolsMerchantSheet from "./src/merchants.js";
import {ItemRegionDSA5, ItemAvailabilityDSA5} from "./src/item-sheet.js";
import {PlayersView} from "./src/players-view.js";

export const moduleName = "dsa5-meistertools";  // just in case I need to change the modules name


/**
 * Initialize Meistertools
 */
Hooks.once('init', async () => {
    console.log(moduleName, "| Initializing MeisterTools")
    MeistertoolsSettings.registerSettings()
    registerHandlebarHelper()


    const {showMapMaker, showSettings, showEntityTagger} = game.settings.get(moduleName, 'general')
    game.meistertools = {
        modules: [
            {...NscFactory.meisterModule, showEntry: true},
            {...SceneDirector.meisterModule, showEntry: true},
            {...RuleBook.meisterModule, showEntry: true},
            {...MeistertoolsLocator.meisterModule, showEntry: true}
        ],
        applications: {},
    }
    game.meistertools.modules.push({
        key: "players-view",
        isButton: true,
        class: PlayersView
    })


    if (showMapMaker)
        game.meistertools.modules.push({
            name: "Map Maker",
            icon: "fas fa-drafting-compass",
            key: "mapmaker",
            class: SceneParser,
            showEntry: true
        })

    if (showEntityTagger)
        game.meistertools.modules.push({
            name: "Entity Manager",
            icon: "fas fa-tags",
            key: "entity-tagger",
            class: MeistertoolsRarity,
            showEntry: true
        })

    game.meistertools.modules.push({...MeistertoolsSettings.meisterModule, showEntry: !!showSettings})


    /**
     * register Actor Sheet to support Merchant
     */
    Actors.registerSheet("dsa5", MeistertoolsMerchantSheet, {types: ["npc"]});

    /**
     * register Item Sheets to support Locations
     */
    Items.registerSheet("dsa5", ItemRegionDSA5, {types: ["equipment"]});
    Items.registerSheet("dsa5", ItemAvailabilityDSA5, {types: []});

    loadTemplates([
        "modules/dsa5-meistertools/templates/settings/general.hbs",
        "modules/dsa5-meistertools/templates/settings/nsc-factory.hbs",
        "modules/dsa5-meistertools/templates/settings/scene.hbs",
        "modules/dsa5-meistertools/templates/settings/locations.hbs",
        "modules/dsa5-meistertools/templates/item-rarity.hbs",
        "modules/dsa5-meistertools/templates/item-region.hbs",
        "modules/dsa5-meistertools/templates/merchant-gm.hbs",
    ])
});


/**
 * Adds a new Control Group for meistertools shenanigans
 */
Hooks.on('renderSceneControls', async (controls, html) => {
    await MeistertoolsControls.registerControls(controls, html)
    controls.controls.find(c => (c.name === "token")).tools.push({
        name: "players-view",
        title: 'DSA MeisterTools',
        icon: "fas fa-eye",
        button: true,
        onClick: (ev) => MeistertoolsControls._openApp(ev, html)
    })
});


/**
 * Add Entries to the SceneControl
 */
Hooks.on("getSceneControlButtons", (controls, html) => {
    controls.find(c => (c.name === "token")).tools.push({
        name: "players-view",
        title: 'DSA MeisterTools',
        icon: "fas fa-eye",
        button: true,
        onClick: (ev) => MeistertoolsControls._openApp(ev, html)
    })
})


/**
 * when the locator token is moved, check for the new regions that apply
 */
Hooks.on("preUpdateToken", async (token, delta, ...param) => {
    let scene
    if (!game.user.isGM || (!delta.x && !delta.y)) return
    if (MeistertoolsLocator.currentLocatorToken === token._id) {
        mergeObject(token.data, delta)
        MeistertoolsLocator.updateLocation(token)
    }
});


/**
 * Set currentBiome if a biome is assigned to the activated scene
 */
Hooks.on('updateScene', (scene, data) => {
    if (!game.user?.isGM) return
    const currentBiome = scene.getFlag(moduleName, 'biome')
    if (currentBiome)
        MeistertoolsLocator.currentLocation = {currentBiome}
})

