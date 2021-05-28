//import DSA5Payment from "../../../systems/dsa5/modules/system/payment.js";
import ActorSheetdsa5NPC from "../../../systems/dsa5/modules/actor/npc-sheet.js";
import {moduleName} from "../meistertools.js";
import {MERCHANT_TYPE, PRICE, QUALITY, LIBRARY_ITEM_TYPES} from "../config/merchants.config.js";

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
        this.merchantFlags = this.actor.getFlag(moduleName, 'merchant')
        mergeObject(data, {options: {QUALITY, PRICE, MERCHANT_TYPE, LIBRARY_ITEM_TYPES}, ...this.merchantFlags})
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".re-roll").click(event => {
            const rollType = $(event.currentTarget).attr("data-roll-type")
            console.log(rollType)
        })

        html.find(".show-settings").click(() => {
            $(".edit-settings").toggle(100)
            this.actor.setFlag(moduleName, "merchant.general.edit-settings", !this.merchantFlags?.general?.["edit-settings"] || true)
        })

        html.find(".add-category").click(() => {
            const supply = this.merchantFlags?.supply || []
            supply.push({})
            this.actor.setFlag(moduleName, 'merchant.supply', supply)
        })

        html.find(".delete-category").click((event) => {
            const categoryId = $(event.currentTarget).attr("data-category-id")
            const {supply} = this.merchantFlags
            supply.splice(categoryId, 1)
            this.actor.setFlag(moduleName, 'merchant.supply', supply)
        })

        html.find("select").change(e => this._handleChange(e))
        html.find("input").change(e => this._handleChange(e))
    }

    _handleChange(event) {
        const categoryId = $(event.currentTarget).attr("data-category-id")
        const name = event.currentTarget.name
        const value = (event.currentTarget.type === "checkbox")
            ? event.currentTarget.checked
            : event.currentTarget.value
        if (!categoryId)
            return this.actor.setFlag(moduleName, "merchant." + name, value)

        const {supply} = this.merchantFlags
        supply[categoryId][name] = value
        this.actor.setFlag(moduleName, 'merchant.supply', supply)
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
