import {updatePlaylist} from "./src/update-playlist.js";
import {registerSettings} from "./src/register-settings.js";
import {registerLayer, registerControlButtons} from "./src/register-layer.js";
import {registerHandlebarHelper} from "./src/register-handlebar-helper.js";
import {MeistertoolsLocator} from "./src/locator.js";
import MeistertoolsMerchantSheet from "./src/merchants.js";
import {ItemRegionDSA5, ItemAvailabilityDSA5} from "./src/item-sheet.js";


/** ******************************
 *  Constants
 */

export const moduleName = "dsa5-meistertools";  // just in case I need to change the modules name


/** ******************************
 *  Hooks
 */


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
 * Add Entries to the SceneControl
 */
Hooks.on("getSceneControlButtons", (controls) => registerControlButtons(controls))

/**
 * Registers settings
 */
Hooks.once('init', () => {
    console.log(moduleName, "| Initializing MeisterTools")
    registerSettings()
    registerLayer()
    registerHandlebarHelper()

    Actors.registerSheet("dsa5", MeistertoolsMerchantSheet, {types: ["npc"]});

    Items.registerSheet("dsa5", ItemRegionDSA5, {types: ["equipment"]});
    Items.registerSheet("dsa5", ItemAvailabilityDSA5, {types: []});

    loadTemplates(["modules/dsa5-meistertools/templates/item-rarity.hbs"])
});


Hooks.on('updateScene', (scene, data) => {
    if (!game.user?.isGM) return
    updatePlaylist(scene, data)
    const currentBiome = scene.getFlag(moduleName, 'biome')
    if (currentBiome)
        MeistertoolsLocator.currentLocation = {currentBiome}
})



// Bilder von https://www.pexels.com/
