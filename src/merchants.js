//import DSA5Payment from "../../../systems/dsa5/modules/system/payment.js";
import ActorSheetdsa5NPC from "../../../systems/dsa5/modules/actor/npc-sheet.js";
import {MeistertoolsUtil} from "../meistertools-util.js";
import {MeistertoolsRarity} from "./rarity.js";
import {moduleName} from "../meistertools.js";
import {
    MERCHANT_TYPE,
    PRICE,
    QUALITY,
    LIBRARY_ITEM_TYPES,
    DEFAULT_CATEGORY_ENTRY,
    RANDOM_TAVERN_NAME,
    SOURCE_TYPES
} from "../config/merchants.config.js";

export default class MeistertoolsMerchantSheet extends ActorSheetdsa5NPC {
    constructor(...args) {
        super(...args);
        this.rolltableOptions = []
        this.packOptions = []
        this.setOptions().then(() => this.render(true))
    }

    async setOptions() {
        for (let pack of game.packs) {

            if (pack.metadata.entity === 'RollTable') {
                const packName = pack.collection
                const content = await pack.getContent()
                this.rolltableOptions.push({_id: null, packName: null, name: "----------------- " + packName})
                for (let tableOption of content)
                    this.rolltableOptions.push({_id: tableOption._id, packName, name: tableOption.data.name})
            }

            if (pack.metadata.entity === 'Item') {
                this.packOptions.push({key: pack.collection, name: pack.metadata.label})
            }

        }
    }


    static get defaultOptions() {
        const options = super.defaultOptions;
        mergeObject(options, {
            classes: options.classes.concat(["meistertools", "dsa5", "actor", "npc-sheet", "merchant-sheet"]),
            width: (game.user.isGM) ? 900 : 400,
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
        mergeObject(data, {
            options: {
                QUALITY, PRICE, MERCHANT_TYPE, LIBRARY_ITEM_TYPES,
                ROLLTABLES: this.rolltableOptions,
                PACKS: this.packOptions
            },
            ...this.merchantFlags
        })
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".re-roll").click(async event => {
            const rollType = $(event.currentTarget).attr("data-roll-type")
            if (rollType === "tavern-name") {
                this.actor.setFlag(moduleName, "merchant.general.tavern-name", getRandomEstablishmentName())
            } else if (rollType === "current") {
                for (const category of this.merchantFlags.supply)
                    await calculateCurrent(category, this.merchantFlags.general)
            } else {
                const n = parseInt(rollType.split("-")[1])
                await calculateCurrent(this.merchantFlags.supply[n], this.merchantFlags.general)
            }
            this.actor.setFlag(moduleName, 'merchant.supply', this.merchantFlags.supply)
        })

        html.find(".show-settings").click(() => {
            $(".edit-settings").toggle(100)
            this.actor.setFlag(moduleName, "merchant.general.edit-settings",
                (this.merchantFlags?.general?.["edit-settings"] === undefined)
                    ? true
                    : !this.merchantFlags.general["edit-settings"]
            )
        })

        html.find(".add-category").click(() => {
            const supply = this.merchantFlags?.supply || []
            supply.push(DEFAULT_CATEGORY_ENTRY)
            this.actor.setFlag(moduleName, 'merchant.supply', supply)
        })

        html.find(".delete-category").click((event) => {
            const categoryId = $(event.currentTarget).attr("data-category-id")
            const {supply} = this.merchantFlags
            supply.splice(categoryId, 1)
            this.actor.setFlag(moduleName, 'merchant.supply', supply)
        })

        html.find("input.merchant,select.merchant").change(e => this._handleChange(e))

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

        for (const c of event.currentTarget.classList)
            if (SOURCE_TYPES.includes(c)) {
                supply[categoryId]["source-type"] = c
                break
            }
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

function getRandomEstablishmentName() {
    const rndArr = arr => arr[Math.floor(Math.random() * arr.length)]
    return `${rndArr(RANDOM_TAVERN_NAME.article)} ${rndArr(RANDOM_TAVERN_NAME.adjective)} ${rndArr(RANDOM_TAVERN_NAME.subject)}`
}

async function calculateCurrent(category, {quality, price}) {
    const amount = MeistertoolsUtil.rollDice(category["amount-q" + quality])
    const {"source-type": sourceType, "source-id": sourceId, "filter-text": filterText, "filter-rarity": filterRarity} = category

    let itemsArray = []
    if (sourceType === "rolltable") {
        const [id, packName] = sourceId.split('@')
        const pack = game.packs.get(packName)
        const table = await pack.getEntry(id)
        for (let {collection, resultId, type} of table.results) {
            if (type !== 2) continue
            const p = game.packs.get(collection)
            const e = await p.getEntity(resultId)
            itemsArray.push(e)
        }
    } else if (sourceType === "items") {
        const pack = game.packs.get(sourceId)
        itemsArray = await pack.getContent()
    } else if (sourceType === "library") {
        const itemLibrary = game.dsa5.itemLibrary
        if (!itemLibrary.equipmentBuild)
            await itemLibrary.buildEquipmentIndex()
        const itemIndex = itemLibrary.equipmentIndex.search(sourceId, {field: ["itemType"]})
        itemsArray = itemIndex.map(i => i.document)
    }

    if (filterText)
        itemsArray = itemsArray.filter(e => e.name.toLowerCase().includes(filterText.toLowerCase())
            || e.data.data?.description?.value?.toLowerCase().includes(filterText.toLowerCase()))

    const results = []
    for (const item of itemsArray) {
        const rarity = filterRarity
            ? await MeistertoolsRarity.getCurrentRarity(item)
            : item.data.data?.rarity?.current || 3
        results.push({
            collection: item.compendium.collection,
            weight: rarity * rarity,
            type: 2,
            text: item.name,
            resultId: item._id,
            img: item.img,
            drawn: false,
            range: [-1, -1],
            flags: {}
        })
    }

    const tableData = {
        name: 'rolltable_TEMPORARY',
        formula: `1d${results.length}`,
        replacement: false,
        displayRoll: false,
        results
    }
    let table = await RollTable.create(tableData)
    await table.normalize()
    const res = await table.drawMany(amount)
    table.delete()

    category.current = []
    for (let entry of res.results) {
        const p = game.packs.get(entry.collection)
        const item = await p.getEntity(entry.resultId)
        category.current.push(item)
    }
}
