import {moduleName} from "../meistertools.js";

export class ManageProps extends Application {
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
            template: `modules/${moduleName}/templates/manage-props.hbs`,
            id: 'meistertools.manage-props',
            title: 'Props verwalten',
        });
    }

    async getData() {
        return {}
    }

    activateListeners(html) {
        super.activateListeners(html);
    }

}
