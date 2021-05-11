import {Dsa5Probability} from "../dsa5-probability.js";

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
     * returns html formatted display of a probability object
     */
    Handlebars.registerHelper('display_probability', function (probability, view) {
        if (!probability) return ``
        let result = ``

        if (view === 'current') {
            if (probability.current === undefined || probability.current === null) return ''
            result = `<span class="probability star${probability.current}"> </span>`
            return new Handlebars.SafeString(result);
        }

        if (view === 'string') {
            result = `<p>allg: ${probability.general}, nach Region: ${JSON.stringify(probability.regions)}, nach Landschafts-Typ: ${JSON.stringify(probability.biomes)}</p>`
            return new Handlebars.SafeString(result);
        }

        result = `<span>`
        if (probability.general !== undefined)
            result += `<span class="probability star${probability.general}"></span>`
        for (let region of probability?.regions)
            result += `<span class="probability star${region[1]}"> ${region[0]}</span>`
        for (let biome of probability?.biomes)
            result += `<span class="probability star${biome[1]}"> ${biome[0]}</span>`
        result += `</span>`
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


    // todo already defined?
    Handlebars.registerHelper('ifeq', function (a, b, options) {
        if (a === b) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    // todo deprecated? not used any more
    Handlebars.registerHelper('each_when', function (list, k, v, opts) {
        let i, result = '';
        for (i = 0; i < list?.length; ++i)
            if (list[i][k]?.includes(v))
                result = result + opts.fn(list[i]);
        return result;
    });

}
