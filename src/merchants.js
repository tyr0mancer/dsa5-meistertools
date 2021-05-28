//import DSA5Payment from "../../../systems/dsa5/modules/system/payment.js";
import ActorSheetdsa5NPC from "../../../systems/dsa5/modules/actor/npc-sheet.js";
import {moduleName} from "../meistertools.js";



export default class MeistertoolsMerchantSheet extends ActorSheetdsa5NPC {
    static get defaultOptions() {
        const options = super.defaultOptions;
        mergeObject(options, {
            classes: options.classes.concat(["meistertools"]),
            width: (game.user.isGM) ? 1200 : 400,
            height: (game.user.isGM) ? 800 : 600,
        });

        return options;
    }

    get template() {
        if (this.playerViewEnabled())
            return `modules/${moduleName}/templates/merchant-player.hbs`
        else
            return `modules/${moduleName}/templates/merchant-gm.hbs`
    }

    activateListeners(html) {
        super.activateListeners(html);
    }

    playerViewEnabled() {
        return !game.user.isGM || getProperty(this.actor.data.data, "merchant.playerView")
    }

    async getData() {
        const data = super.getData();
        mergeObject(data, {})
        return data;
    }


}
