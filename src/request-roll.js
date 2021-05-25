import {moduleName} from "../meistertools.js";

export class RequestRoll extends Application {
    constructor() {
        super();
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['meistertools'],
            top: 50,
            left: 100,
            width: 800,
            height: 650,
            resizable: true,
            template: `modules/${moduleName}/templates/request-roll.hbs`,
            id: 'meistertools.request-roll',
            title: 'Fokus Regeln',
        });
    }

    async getData() {
        return {}
    }

    activateListeners(html) {
        super.activateListeners(html);
    }

}
