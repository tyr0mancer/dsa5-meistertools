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
     * @param obj
     * @return {{}}
     */
    static expandObjectAndArray(obj) {
        const expanded = {};
        for (let [k, v] of Object.entries(obj)) {
            let parsedVal = v
            // todo this is way to expensive
            try {
                parsedVal = JSON.parse(v);
            } catch (e) {
                parsedVal = v
            }
            this.setProperty(expanded, k, parsedVal);
        }
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
                    if (!obj.hasOwnProperty(property) || !Array.isArray(obj[property])) obj[property] = [];

                    let index = parseInt(match[2])
                    if (isNaN(index) || index < 0) {
                        index = obj[property].length
                    }

                    while (obj[property].length <= index) {
                        obj[property].push({})
                    }
                    return obj[property][index];
                } else {
                    if (!obj.hasOwnProperty(currentKey)) obj[currentKey] = {};
                    return obj[currentKey];
                }
            }, object);
        }
        // Update the target
        if (target[key] !== value) {
            changed = true;
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
            $(event.target).parent().parent().removeClass()
            $(event.target).parent().parent().addClass('dropdown scene-position ' + event.currentTarget.value)
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


    static activePlayers() {
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

    static playerActors() {
        const activeUserIds = game.users
            .filter(u => u.role !== 4)
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


}


/**
 * Find images in the deepest possible path
 * FilePicker Variation with no UI
 */
export class FileBrowser extends FilePicker {
    constructor(options) {
        super(options);
    }

    /* -------------------------------------------- */

    /**
     * Browse to a specific location for this FilePicker instance
     * @param {string} [target]   The target within the currently active source location.
     * @param {Object} [options]  Browsing options
     */
    async browse(target, options = {}) {

        // If the user does not have permission to browse, do not proceed
        if (game.world && !game.user.can("FILES_BROWSE")) return;

        // Configure browsing parameters
        target = typeof target === "string" ? target : this.target;
        const source = this.activeSource;
        options = mergeObject({
            extensions: this.extensions,
            wildcard: false
        }, options);

        // Determine the S3 buckets which may be used
        if (source === "s3") {
            if (this.constructor.S3_BUCKETS === null) {
                const buckets = await this.constructor.browse("s3", "");
                this.constructor.S3_BUCKETS = buckets.dirs;
            }
            this.sources.s3.buckets = this.constructor.S3_BUCKETS;
            if (!this.source.bucket) this.source.bucket = this.constructor.S3_BUCKETS[0];
            options.bucket = this.source.bucket;
        }

        // Avoid browsing certain paths
        if (target.startsWith("/")) target = target.slice(1);
        if (target === CONST.DEFAULT_TOKEN) target = this.constructor.LAST_BROWSED_DIRECTORY;

        // Request files from the server
        const result = await this.constructor.browse(source, target, options).catch(error => {
            ui.notifications.warn(error);
            return this.constructor.browse(source, "", options);
        });

        // Populate browser content
        this.result = result;
        this.source.target = result.target;
        if (source === "s3") this.source.bucket = result.bucket;
        this.constructor.LAST_BROWSED_DIRECTORY = result.target;
        this._loaded = true;

        // Render the application
        return result;
    }

}





