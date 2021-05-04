import {moduleName} from "../meistertools.js";
import {MeistertoolsUtil, MyCompendia, MyFilePicker} from "../meistertools-util.js";

export class Dsa5Nightwatch extends Application {

    constructor() {
        super();
        this.tiles = []
        this.players = MeistertoolsUtil.playerActors()
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            title: `Nachtwache`,
            resizable: true,
            top: 80,
            left: 100,
            width: 600,
            height: 800,
            popOut: true,
            classes: ['form'],
            template: `modules/${moduleName}/templates/nachtwache.html`,
            id: `${moduleName}.manage-scenes`,
            tabs: [{navSelector: ".tabs", contentSelector: ".content", initial: "initial-tab"}]
        });
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find("nav.help-icon").click((event) => $('.help-info.help-' + $(event.currentTarget).attr("data-help")).toggle())


    }

    async getData() {
        return {
            players: this.players,
            images: {
                fireplace: "modules/dsa5-core/icons/equipment/FeuersteinundStahl.webp",
                tent: "modules/dsa5-core/icons/equipment/Zelt1Person.webp",
                bag: "modules/dsa5-core/icons/equipment/Schlafsack.webp"
            }
        };
    }

}
