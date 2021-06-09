import {updatePlaylist} from "./src/update-playlist.js";
import {registerLayer, registerControlButtons} from "./src/register-layer.js";
import {registerHandlebarHelper} from "./src/register-handlebar-helper.js";
import {MeistertoolsLocator} from "./src/locator.js";
import MeistertoolsMerchantSheet from "./src/merchants.js";
import {ItemRegionDSA5, ItemAvailabilityDSA5} from "./src/item-sheet.js";
import {MeistertoolsSettings} from "./modules/settings.mjs";


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


Hooks.on('updateScene', (scene, data) => {
    if (!game.user?.isGM) return
    updatePlaylist(scene, data)
    const currentBiome = scene.getFlag(moduleName, 'biome')
    if (currentBiome)
        MeistertoolsLocator.currentLocation = {currentBiome}
})


function registerSettings() {
    game.settings.registerMenu(moduleName, "config-ui", {
        name: "DSA5 Meistertools",
        label: "Einstellungen",
        hint: "Alle Einstellungen der DSA5 Meistertools",
        icon: "fas fa-eye",
        type: MeistertoolsSettings,
        restricted: true
    });
    for (const category of MeistertoolsSettings.categories)
        game.settings.register(moduleName, category.key, {
            default: category.default,
            scope: "world", config: false, type: Object
        });
}


/** ******************************
 *  Constants
 */

export const MT = {
    moduleName: "dsa5-meistertools",
    colorPalette: ['#536DFE', '#FF9800', '#795548', '#455A64', '#03A9F4', '#D32F2F'],
    umlaute: {
        '\u00dc': 'UE',
        '\u00c4': 'AE',
        '\u00d6': 'OE',
        '\u00fc': 'ue',
        '\u00e4': 'ae',
        '\u00f6': 'oe',
        '\u00df': 'ss'
    }
}

export const moduleName = "dsa5-meistertools";  // just in case I need to change the modules name


const COLOR_PALETTE = ['#536DFE', '#FF9800', '#795548', '#455A64', '#03A9F4', '#D32F2F']
const UMLAUTE = {
    '\u00dc': 'UE', '\u00c4': 'AE', '\u00d6': 'OE', '\u00fc': 'ue', '\u00e4': 'ae', '\u00f6': 'oe', '\u00df': 'ss'
}

function replaceUmlaute(str) {
    return str
        .replace(/[\u00dc|\u00c4|\u00d6][a-z]/g, (a) => {
            const big = UMLAUTE[a.slice(0, 1)];
            return big.charAt(0) + big.charAt(1).toLowerCase() + a.slice(1);
        })
        .replace(new RegExp('[' + Object.keys(UMLAUTE).join('|') + ']', "g"),
            (a) => UMLAUTE[a]
        );
}


export class MeistertoolsUtil {
    /**
     * get unique color which is fix for a string. no check for collision
     */
    static niceColor(index) {
        let realIndex = index % COLOR_PALETTE.length
        return COLOR_PALETTE[realIndex]
    }


    static stringToKey(str, dim = ',', pos) {
        str = replaceUmlaute(str).toLowerCase()
        if (dim) {
            if (pos === 'last')
                return str.split(dim).pop()
            else
                return str.split(dim)[pos || 0]
        }
        return str
    }


    /**
     *
     * @param a
     * @param b
     * @return {number}
     */
    static strcmp(a, b) {
        if (a === b) {
            return 0;
        }

        if (a > b) {
            return 1;
        }

        return -1;
    }


    /**
     *
     * @param obj
     * @return {{}}
     */
    static expandObjectAndArray(obj) {
        if (obj === undefined) return undefined
        const expanded = {};
        for (let [k, v] of Object.entries(obj)) {
/*
            let parsedVal = v
            // todo seems to be too expensive. most values arent json that need parsing here. trying with data-dtype="JSON"

            try {
                parsedVal = JSON.parse(v);
            } catch (e) {
                parsedVal = v
            }
*/
            //console.log(k)
            //console.log(v)
            this.setProperty(expanded, k, v);
        }

        console.log(expanded)

        return expanded;
    }

    /**
     *
     * @param object
     * @param key
     * @param value
     * @return {boolean}
     */
    static setProperty(object, key, value) {
        let target = object;
        let changed = false;
        // Convert the key to an object reference if it contains dot notation
        if (key.indexOf('.') !== -1) {
            let parts = key.split('.');
            key = parts.pop();
            target = parts.reduce((obj, currentKey) => {

                let match = currentKey.match(/^(.*)\[(.*)]$/)
                if (match) {
                    const property = match[1]
                    if (!obj.hasOwnProperty(property) || !Array.isArray(obj[property])) obj[property] = [{}];

                    let index = obj[property].length - 1
                    if (obj[property][index][key] !== undefined)
                        index++
                    while (obj[property].length <= index)
                        obj[property].push({})

                    return obj[property][index];
                    // >stuff.txt*/

                } else {
                    if (!obj.hasOwnProperty(currentKey)) obj[currentKey] = {};
                    return obj[currentKey];
                }
            }, object);
        }
        // Update the target
        if (target[key] !== value) {
            changed = true;
            console.log(target)
            console.log(key)
            console.log(value)
            target[key] = value;
        }
        // Return changed status
        return changed;
    }


    /**
     *
     * @param html
     * @param callback
     */
    static addDefaultListeners(html, callback = {}) {
        html.find("div.dropdown.scene-position").find("input").change(event => {
            $(event.target).parent().parent().parent().parent().removeClass()
            $(event.target).parent().parent().parent().parent().addClass('dropdown scene-position ' + event.currentTarget.value)
        })
        html.find("input.pick-path").dblclick((event) => {
            new FilePicker({
                type: "image",
                current: event.currentTarget.value,
                callback: (imagePath) => {
                    event.currentTarget.value = imagePath
                    $(event.currentTarget).css("background-image", "url(" + event.currentTarget.value + ")")
                },
            }).browse(event.currentTarget.value)
        })
        html.find("input.pick-path").change((event) => {
            $(event.currentTarget).css("background-image", "url(" + event.currentTarget.value + ")")
        })
        html.find(".toggle").click((event) => {
            const targetName = $(event.currentTarget).attr("data-target")
            $(event.currentTarget).toggleClass('show')
            $(targetName).toggle(100)
            if (callback.onToggle && typeof callback.onToggle === 'function') {
                callback.onToggle(targetName)
            }
        })
        if (callback.onChange && typeof callback.onChange === 'function') {
            html.find("input,select").change(event => callback.onChange(event, html))
        }
    }


    /**
     *
     * @param array
     * @return {Error|undefined|*}
     */
    static drawFromArray(array) {
        if (!Array.isArray(array)) return new Error('is not an Array')
        if (array.length === 0) return undefined
        return array[Math.floor(Math.random() * array.length)]
    }

    /**
     * async str.replace()
     * @see https://dev.to/ycmjason/stringprototypereplace-asynchronously-28k9
     * @param str
     * @param regex
     * @param callback
     * @return {Promise<string>}
     */
    static async asyncStringReplace(str, regex, callback) {
        const result = [];
        let match;
        let i = 0;
        while ((match = regex.exec(str)) !== null) {
            // put non matching string
            result.push(str.slice(i, match.index));
            // call the async replacer function with the matched array spreaded
            result.push(callback(...match));
            i = regex.lastIndex;
        }
        // put the rest of str
        result.push(str.slice(i));
        // wait for aReplacer calls to finish and join them back into string
        return (await Promise.all(result)).join('');
    };


    /**
     *
     * @param pattern
     * @return {number}
     */
    static rollDice(pattern) {
        if (!pattern) return 0
        pattern = pattern.toLowerCase().replace('w', 'd')
        const terms = pattern.split("+")
        return terms.reduce((prev, cur) => {
            let r = new Roll(cur);
            r.evaluate()
            return prev + parseInt(r.total)
        }, 0)
    }


    /**
     * looks for folder with given name amd type or creates a new one
     * returns the folder object
     * @param folderName
     * @param entityType
     */
    static async getFolder(folderName, entityType) {
        if (!folderName || !entityType) return {}
        let result = game.folders.find(f => f.name === folderName && f.type === entityType)
        if (!result) {
            result = await Folder.create({
                "name": folderName,
                "type": entityType,
                "sort": 300000,
                "parent": null,
                "sorting": "m",
                "color": "#763626"
            });
            ui.notifications.info(`Ein Ordner vom Typ ${entityType} mit dem Namen '${folderName}' wurde nicht gefunden. MeisterTools hat den Ordner erstellt.`);
        }
        return result;
    }


    /** **************************************
     * potentially deprecated
     ************************************** */


    static async requestRoll({talent, modifier, reason, playerName}) {
        return new Promise((resolve) => {

            let whisper = playerName ? ChatMessage.getWhisperRecipients(playerName) : undefined
            const mod = modifier < 0 ? ` ${modifier}` : (modifier > 0 ? ` +${modifier}` : "")
            let msg = `<a class="roll-button request-roll" data-type="skill" data-modifier="${modifier}" data-name="${talent}"><i class="fas fa-dice"></i> ${talent}${mod}</a>`
            if (reason)
                msg += ` - <b>${playerName}</b>`
            ChatMessage.create({content: msg, whisper});
            new Dialog({
                title: `Eine Probe in ${talent} anfordern`,
                content: `<h3>${reason}</h3>`,
                buttons: {
                    one: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "1 QS",
                        callback: () => resolve({success: true, qs: 1})
                    },
                    two: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "2 QS",
                        callback: () => resolve({success: true, qs: 2})
                    },
                    three: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "3 QS",
                        callback: () => resolve({success: true, qs: 3})
                    },
                    failure: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Nicht bestanden",
                        callback: () => resolve({success: false})
                    },
                    critical: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Patzer",
                        callback: () => resolve({success: false, critical: true})
                    }
                },
                default: "failure"
            }).render(true);

        });
    }


    static get activePlayers() {
        const activeUserIds = game.users
            .filter(u => u.active && u.role !== 4)
            .map(u => u._id)

        return game.actors
            .filter(u => {
                for (let userId of activeUserIds) {
                    if (u.data.permission[userId] === 3)
                        return true
                }
                return false
            })
    }

    static get playerActors() {
        const userIds = game.users.filter(u => u.role !== 4).map(u => {
            return {_id: u._id, active: u.active}
        })

        return game.actors
            .filter(a => {
                for (let userId of userIds)
                    if (a.data.permission[userId._id] === 3)
                        return true
                return false
            })
            .map(a => {
                    let active = false
                    for (let userId of userIds)
                        if (a.data.permission[userId._id] === 3)
                            active = userId.active
                    return {actor: a, active}
                }
            )
    }


}


class Rule {
    constructor(delta, q0 = "start", F = ["stop"]) {
        this.deltaFunction = delta
        this.initialState = q0
        this.finalStates = F
    }
}


export class RuleMachine {
    constructor(Q, S, delta, q0, F) {
    }
}





