import {moduleName} from "../meistertools.js";

export class EntityTagger extends Application {
    constructor() {
        super();
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            top: 50,
            left: 50,
            width: 800,
            height: 800,
            resizable: true,
            template: `modules/${moduleName}/templates/entity-tagger.hbs`,
            id: 'meistertools.settings',
            title: 'MeisterTools Settings',
            tabs: [{navSelector: ".tabs", contentSelector: ".content", initial: "nsc"}]
        });
    }

    async getData() {
        return {}
    }

    activateListeners(html) {
        super.activateListeners(html);
        //MeistertoolsUtil.addDefaultListeners(html);
    }


}
