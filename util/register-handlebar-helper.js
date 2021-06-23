import DSA5Payment from "../../../systems/dsa5/modules/system/payment.js";
import {MeistertoolsRarity} from "../src/rarity.js";

export const HandlebarHelper = {
    stringify: (obj, formatted) => (formatted === true) ? new Handlebars.SafeString(`<pre>${JSON.stringify(obj, null, 2)}</pre>`) : JSON.stringify(obj, null, 2),

    display_rarity: (rarity, comment = "", showRarityDescription = false) => {
        rarity = parseInt(rarity)
        if (rarity === undefined) return ``
        const desc = game.i18n.localize(MeistertoolsRarity.rarityDescription(rarity))
        if (typeof comment !== "string") comment = ""
        const description = showRarityDescription ? desc : ""
        const title = `${desc} ${comment}`
        const result = `<span class="rarity star${rarity}" title="${title}"> ${description}</span>`
        return new Handlebars.SafeString(result);
    },
    /**
     * Creates Link to toggle the visibility collapsible(s) with given class
     * @see collapsible
     *
     * ```handlebars
     * <!-- store: {} -->
     * {{#toggle "player-list:show" store}}<h1>Show Players</h1>{{/toggle}}
     * <!-- results in: '<h1 class="toggle" data-target=".player-list">Show Players</h1>' -->
     *
     * <!-- store: {player-list:false} -->
     * {{#toggle "player-list" store}}<h1>Show Players</h1>{{/toggle}}
     * <!-- results in: '<h1 class="toggle show" data-target=".player-list">Show Players</h1>' -->
     * ```
     * @param {String} keyString
     * @param {Object} store
     * @param {Object} content
     * @return {String}
     */
    toggle: (keyString, store, content = store) => {
        const [key, initial] = keyString.split(":") || [keyString, undefined]
        const show = (store?.[key] !== undefined) ? (store[key]) : (initial !== undefined) ? !!initial : false
        return `<a class="toggle ${show ? '' : 'show'}" data-target=".${key}">${content.fn()}</a>`
    }
    ,
    /**
     * Creates a collapsible which visibility can be triggered by elements with class ".toggle.${key}"
     * @see toggle
     *
     * ```handlebars
     * <!-- store: {} -->
     * {{#collapsible "player-list:show" store}}<ul><li>...</li></ul>{{/collapsible}}
     * ```
     * @param {String} keyString
     * @param {Object} store
     * @param {Object} content
     * @return {String}
     */
    collapsible: (keyString, store, content = store) => {
        const [key, initial] = keyString.split(":") || [keyString, undefined]
        const show = (store?.[key] !== undefined) ? (store[key]) : (initial !== undefined) ? !!initial : false
        return `<div class="${key} ${show ? '' : 'hidden'}">${content.fn()}</div>`
    },

    /**
     * todo rename
     * Scene Position Picker, applies for new tokens in NSC Factory
     * @param name
     * @param value
     * @param options
     * @param position
     * @return {String}
     */
    "pick_scene-position":
        (name, value, options, position = "left") => {
            let result = `<div class="dropdown scene-position ${value}"><div class="box dropdown-content ${position} header"><h3>Token Position</h3><div class="col-3">`
            for (let option of options)
                result += `<div><input id="${name}-${option.key}" ${(option.key === value) ? "checked" : ""} type="radio" name="${name}" value="${option.key}"/><label for="${name}-${option.key}"><div class="scene-position ${option.key} s" title="${option.description}"> </div></label></div>`
            result += `</div></div></div>`
            return new Handlebars.SafeString(result);
        },

    /**
     *
     * @param {String} description
     * @return {String}
     */
    "skill_options":
        (description) => {
            const modifiers = [
                {value: 5, label: "+5", text: "extrem leichte Probe"},
                {value: 3, label: "+3", text: "sehr leichte Probe"},
                {value: 1, label: "+1", text: "leichte Probe"},
                {value: 0, label: "+/- 0", text: "normale Probe"},
                {value: -1, label: "-1", text: "schwere Probe"},
                {value: -3, label: "-3", text: "sehr schwere Probe"},
                {value: -5, label: "-5", text: "extrem schwere Probe"}
            ]
            $(`<div>${description}</div>`).find('div.row-section.wrap.lineheight2 div span').each((i, example) => {
                const text = example.innerText

                let modifier = $(example).parent()?.next()?.[0]?.innerText
                if (!modifier || modifier.match(/[a-zA-Z]/i))
                    return
                const entry = modifiers.find(m => m.value === (parseInt(modifier) || 0))
                if (!entry) return

                entry.text = text
            })
            let result = ``
            for (const {value, label, text} of modifiers) {
                result += `<option value="${value}" ${!value ? "selected" : ""}>${label} ≙ ${text}</option>`
            }
            return new Handlebars.SafeString(result);
        }
}


// todo these need review
export function registerHandlebarHelper() {
    for (const [name, callback] of Object.entries(HandlebarHelper))
        Handlebars.registerHelper(name, callback);

    Handlebars.registerHelper('checked_radio', function (a, b) {
        return (a === b) ? 'checked' : ''
    });

    Handlebars.registerHelper('each_when', function (list, k, v, opts) {
        let i, result = '';
        for (i = 0; i < list?.length; ++i) {
            if (!list[i][k]) continue
            if (typeof list[i][k] === "string" && list[i][k].includes(v))
                result = result + opts.fn(list[i]);
            if (typeof list[i][k] === "boolean" && list[i][k])
                result = result + opts.fn(list[i]);
        }
        return result;
    });

    Handlebars.registerHelper('money', function (a) {
        return DSA5Payment._moneyToString(a)
    });

    Handlebars.registerHelper('ifeq', function (a, b, options) {
        if (a === b) {
            return options.fn(this);
        }
        return options.inverse(this);
    });


}
