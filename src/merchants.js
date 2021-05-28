//import DSA5Payment from "../../../systems/dsa5/modules/system/payment.js";
import ActorSheetdsa5NPC from "../../../systems/dsa5/modules/actor/npc-sheet.js";
import {moduleName} from "../meistertools.js";


export default class MeistertoolsMerchantSheet extends ActorSheetdsa5NPC {

    static get defaultOptions() {
        const options = super.defaultOptions;
        mergeObject(options, {
            classes: options.classes.concat(["meistertools", "dsa5", "actor", "npc-sheet", "merchant-sheet"]),
            width: (game.user.isGM) ? 800 : 400,
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

    async getData() {
        const data = super.getData();
        mergeObject(data, {})
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);
    }


    /*
    Switch between GM and Player View
     */

    playerViewEnabled() {
        return !game.user.isGM || getProperty(this.actor.data.data, "merchant.playerView")
    }

    _togglePlayerview(ev) {
        this.actor.update({"data.merchant.playerView": !getProperty(this.actor.data.data, "merchant.playerView")})
    }

    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        if (game.user.isGM) {
            buttons.unshift({
                class: "playerview",
                icon: `fas fa-toggle-on`,
                onclick: async ev => this._togglePlayerview(ev)
            })
        }
        return buttons
    }


}
