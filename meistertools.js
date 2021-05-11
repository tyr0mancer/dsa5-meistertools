import {updatePlaylist} from "./src/update-playlist.js";
import {registerSettings} from "./src/register-settings.js";
import {registerLayer, registerControlButtons} from "./src/register-layer.js";
import {registerHandlebarHelper} from "./src/register-handlebar-helper.js";
import {MeistertoolsLocator} from "./src/locator.js";

/** ******************************
 *  Constants
 */

export const moduleName = "dsa5-meistertools";  // just in case I need to change the modules name


/** ******************************
 *  Hooks
 */

/**
 * remembers playlist Name in flags and assigns new playlist in case the old playlist was removed
 * and replaced with a playlist with the same name
 */
if (game.user?.isGM && game.settings.get(moduleName, 'scenes')?.updatePlaylist)
    Hooks.on('updateScene', (scene, data) => updatePlaylist(scene, data))


/**
 * when the locator token is moved, check for the new regions that apply
 */
Hooks.on("preUpdateToken", async (scene, token, delta) => {
    if (!game.user.isGM || (!delta.x && !delta.y)) return
    if (MeistertoolsLocator.locatorToken === token._id)
        MeistertoolsLocator.updateLocation(scene, {x: delta.x || token.x, y: delta.y || token.y})
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
});

