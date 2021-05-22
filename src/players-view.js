import {moduleName} from "../meistertools.js";
//import {MeistertoolsLocator, LocationPicker} from "./locator.js";

export class PlayersView extends Application {
    constructor() {
        super();
        //this.settings = {locations: game.settings.get(moduleName, 'locations')}
        Hooks.on(moduleName + ".update-location", (newLocation) => {
            this.render()
        });
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['meistertools'],
            top: 50,
            left: 100,
            width: 800,
            height: 600,
            resizable: true,
            template: `modules/${moduleName}/templates/players-view.hbs`,
            id: 'meistertools.players-view',
            title: 'Spieler Dashboard',
            //tabs: [{navSelector: ".tabs", contentSelector: ".content", initial: "initial"}]
        });
    }

    async getData() {
        return {
            options: {}
        }
    }

    activateListeners(html) {
        super.activateListeners(html);
    }

}
