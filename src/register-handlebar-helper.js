import {MeistertoolsRarity} from "./rarity.js";

export function registerHandlebarHelper() {
    /**
     * returns a string version of an object
     * if formatted=true (which is default) it is also spaced and within a <pre/> Element
     */
    Handlebars.registerHelper('stringify', function (obj, formatted) {
        return (formatted === true)
            ? new Handlebars.SafeString(`<pre>${JSON.stringify(obj, null, 2)}</pre>`)
            : JSON.stringify(obj, null, 2)
    });

    /**
     * returns html formatted display of a rarity object
     */
    Handlebars.registerHelper('display_rarity', function (rarity, title) {
        if (rarity === undefined) return ``
        const result = `<span class="rarity star${rarity}" title="${MeistertoolsRarity.rarityDescription(rarity)} ${title}"> </span>`
        return new Handlebars.SafeString(result);
    });


    /**
     * helper for checkboxes and radio buttons
     */
    Handlebars.registerHelper('ifPropTrue', function (obj, property, value = 'checked') {
        return (obj !== undefined && obj[property]) ? value : ''
    });

    Handlebars.registerHelper('checked_radio', function (a, b) {
        return (a === b) ? 'checked' : ''
    });


    /**
     * position picker
     */
    Handlebars.registerHelper('pick_scene-position', function (name, value, options) {
        let result = `<div class="dropdown scene-position ${value}">
                        <div class="box dropdown-content header">
                            <h3>Wo sollen Token platziert werden?</h3><div class="col-2">`
        for (let option of options)
            result += `<div><input id="${name}-${option.key}" ${(option.key === value) ? "checked" : ""}
                                       type="radio" name="${name}" value="${option.key}"/>
                                <label for="${name}-${option.key}">
                                    <div class="scene-position ${option.key}" title="${option.description}">${option.name}</div>
                                </label></div>`

        result += `</div></div></div>`
        return new Handlebars.SafeString(result);
    });


    /**
     *
     */
    Handlebars.registerHelper('each_when', function (list, k, v, opts) {
        let i, result = '';
        for (i = 0; i < list?.length; ++i)
            if (list[i][k]?.includes(v))
                result = result + opts.fn(list[i]);
        return result;
    });



    // todo already defined?
    Handlebars.registerHelper('ifeq', function (a, b, options) {
        if (a === b) {
            return options.fn(this);
        }
        return options.inverse(this);
    });


}
