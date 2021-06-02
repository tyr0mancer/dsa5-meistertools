import {updatePlaylist} from "./src/update-playlist.js";
import {registerSettings} from "./src/register-settings.js";
import {registerControlButtons} from "./src/register-layer.js";
import {registerHandlebarHelper} from "./src/register-handlebar-helper.js";
import {MeistertoolsLocator} from "./src/locator.js";
import MeistertoolsMerchantSheet from "./src/merchants.js";


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
Hooks.on("preUpdateToken", async (scene, token, delta) => {
    if (!game.user.isGM || (!delta.x && !delta.y)) return
    if (MeistertoolsLocator.currentLocatorToken === token._id)
        MeistertoolsLocator.updateLocation(scene, mergeObject(token, delta))
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
    //registerLayer()
    registerHandlebarHelper()

    Actors.registerSheet("dsa5", MeistertoolsMerchantSheet, {types: ["npc"]});
});


Hooks.on('updateScene', (scene, data) => {
    if (!game.user?.isGM) return
    updatePlaylist(scene, data)
    const currentBiome = scene.getFlag(moduleName, 'biome')
    if (currentBiome)
        MeistertoolsLocator.currentLocation = {currentBiome}
})

