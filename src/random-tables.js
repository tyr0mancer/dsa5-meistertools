import {moduleName} from "../meistertools.js";

export class RandomTables extends Application {
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
            template: `modules/${moduleName}/templates/random-tables.hbs`,
            id: 'meistertools.random-tables',
            title: 'Zufallstabellen',
        });
    }

    async getData() {
        return {}
    }

    activateListeners(html) {
        super.activateListeners(html);
    }

}
