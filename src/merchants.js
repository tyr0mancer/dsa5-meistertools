import DSA5Payment from "../../../systems/dsa5/modules/system/payment.js";
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
        this.paymentMessages = []
        this.displayMessages = []
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
            ...this.merchantFlags,
            locked: (this.actor.data.permission.default !== 1),
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

        html.find(".toggle-description").click((event) => {
            const target = $(event.currentTarget).attr("data-target")
            $(target).toggle(100)
        })

        html.find(".add-category").click(() => {
            const supply = this.merchantFlags?.supply || []
            supply.push(DEFAULT_CATEGORY_ENTRY)
            this.actor.setFlag(moduleName, 'merchant.supply', supply)
        })


        html.find(".show-category").click((event) => {
            const categoryId = $(event.currentTarget).attr("data-category-id")
            this.merchantFlags.supply[categoryId].current.forEach(entry => entry.visible = true)
            this.actor.setFlag(moduleName, 'merchant.supply', this.merchantFlags.supply)
        })

        html.find(".show-all").click(() => {
            this.merchantFlags.supply.forEach(category => category.current?.forEach(entry => entry.visible = true))
            this.actor.setFlag(moduleName, 'merchant.supply', this.merchantFlags.supply)
        })
        html.find(".hide-all").click(() => {
            this.merchantFlags.supply.forEach(category => category.current?.forEach(entry => entry.visible = false))
            this.actor.setFlag(moduleName, 'merchant.supply', this.merchantFlags.supply)
        })

        html.find(".add-to-cart").click((event) => {
            const categoryId = $(event.currentTarget).attr("data-category-id")
            const entryId = $(event.currentTarget).attr("data-entry-id")
            const cart = this.merchantFlags.cart || []
            const entry = this.merchantFlags.supply[categoryId].current.find(e => e.item._id === entryId)
            cart.push(entry)
            this.actor.setFlag(moduleName, 'merchant.cart', cart)
        })

        html.find(".clear-cart").click(() => {
            this.actor.setFlag(moduleName, 'merchant.cart', [])
        })

        html.find(".serve-cart").click(() => {
            this._serveOrder()
            this._requestPayment()
            this.actor.setFlag(moduleName, 'merchant.cart', [])
        })
        html.find(".request-payment").click(() => {
            this._requestPayment()
            this.actor.setFlag(moduleName, 'merchant.cart', [])
        })


        html.find(".delete-category").click((event) => {
            const categoryId = $(event.currentTarget).attr("data-category-id")
            const {supply} = this.merchantFlags
            supply.splice(categoryId, 1)
            this.actor.setFlag(moduleName, 'merchant.supply', supply)
        })

        html.find("input.merchant,select.merchant").change(e => this._handleChange(e))
        //html.find("input.merchant,select.merchant").change(e => this._handleChange(e))

        html.find(".show-entry").click(event => {
            const categoryId = $(event.currentTarget).attr("data-category-id")
            const entryId = $(event.currentTarget).attr("data-entry-id")
            const {supply} = this.merchantFlags
            const entry = supply[categoryId].current.find(e => e.item._id === entryId)
            entry.visible = true
            this.actor.setFlag(moduleName, 'merchant.supply', supply)
        })

        html.find("a.unlock-merchant").click(() => this._unlockMerchant());
        html.find("a.lock-merchant").click(() => this._lockMerchant());

        html.find("a.delete-payment-messages").click(() => {
            this.paymentMessages.forEach(m => m.delete())
        });

        html.find("a.delete-display-messages").click(() => {
            this.displayMessages.forEach(m => m.delete())
        });

    }

    async _serveOrder() {
        let content = ``
        for (let {item, link} of this.merchantFlags.cart) {
            content += `<div><img src="${item.img}" style="height: 48px; border: none" /><b>${link}</b></div>`
        }

        const message = await ChatMessage.create({
            speaker: {alias: this.merchantFlags.general["tavern-name"]},
            content
        })
        this.displayMessages.push(message)
    }

    async _requestPayment() {
        let sum = 0
        for (let {price} of this.merchantFlags.cart)
            sum += price
        let money = DSA5Payment._getPaymoney(sum.toString())
        if (!money) return
        const message = await ChatMessage.create({
            speaker: {alias: (this.merchantFlags.general.merchantType === "tavern") ? this.merchantFlags.general["tavern-name"] : this.actor.name},
            content: `<button class="payButton" data-amount="${money}">${DSA5Payment._moneyToString(money)} bezahlen</button>`
        })
        this.paymentMessages.push(message)
    }


    async _handleChange(event) {
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
        //console.log(name, value, moduleName)
        console.log(supply)
        await this.actor.setFlag(moduleName, 'merchant.supply', supply)
        console.log(this.actor)
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


    async _unlockMerchant() {
        const perms = this.actor.data.permission
        perms.default = 1
        await this.actor.update({permission: perms})
    }

    async _lockMerchant() {
        const perms = this.actor.data.permission
        perms.default = 0
        await this.actor.update({permission: perms})
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
        const table = await pack.getDocument(id)
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
            ? await MeistertoolsRarity.getCurrentRarity(item) || MeistertoolsRarity.defaultRarity
            : MeistertoolsRarity.defaultRarity

        if (item.compendium)
            results.push({
                collection: item.compendium?.collection,
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
    const res = await table.drawMany(amount, {displayChat: false})
    table.delete()

    category.current = []
    const {sell: sellFactor} = PRICE.find(p => p.key === parseInt(price))
    for (let entry of res.results) {
        const p = game.packs.get(entry.collection)
        const item = await p?.getEntity(entry.resultId)
        const price = parseInt(Math.floor(item?.data.data.price.value * sellFactor * 100).toString().replace(/./g, (c, i) => i <= 1 ? c : "0")) / 100
        category.current.push({item, visible: false, price, link: item.link})
    }
}
