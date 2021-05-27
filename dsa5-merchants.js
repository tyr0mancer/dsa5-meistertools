import DSA5Payment from "../../systems/dsa5/modules/system/payment.js";
import ActorSheetdsa5NPC from "../../systems/dsa5/modules/actor/npc-sheet.js";

const moduleName = "dsa5-merchants-taverns";
const locationModuleName = "dsa5-traveller"

/* todo to be put in config */
const ROLLTABLE_WEIGHT_RARITY = 5
const calculateWeight = (rarity) => rarity * rarity
const INITIAL_WEIGHT = calculateWeight(Math.floor(ROLLTABLE_WEIGHT_RARITY / 2))


/*
const maxQualityOption = 5
const maxPriceOption = 5
*/

// todo tidy this up and make Q and P selectable independently
const qualityOptions = [
    {key: '1', name: "Q1", price: 0.75},
    {key: '2', name: "Q2", price: 1},
    {key: '3', name: "Q3", price: 1.25},
    {key: '4', name: "Q4", price: 1.5},
    {key: '5', name: "Q5", price: 2}
]
const priceOptions = [
    {key: '1', name: "P1", price: 0.75},
    {key: '2', name: "P2", price: 1},
    {key: '3', name: "P3", price: 1.25},
    {key: '4', name: "P4", price: 1.5},
    {key: '5', name: "P5", price: 2}
]

Hooks.once("init", () => {
    Actors.registerSheet("dsa5", TavernSheetDSA5, {types: ["npc"]});
    Handlebars.registerHelper('money', function (a) {
        return DSA5Payment._moneyToString(a)
    });
})


export default class TavernSheetDSA5 extends ActorSheetdsa5NPC {
    static get defaultOptions() {
        const options = super.defaultOptions;
        mergeObject(options, {
            classes: options.classes.concat(["dsa5", "actor", "npc-sheet", "merchant-sheet"]),
            width: (game.user.isGM) ? 1200 : 400,
            height: (game.user.isGM) ? 800 : 600,
        });
        return options;
    }

    get template() {
        if (this.playerViewEnabled())
            return `modules/${moduleName}/templates/tavern-sheet-player.html`
        else
            return `modules/${moduleName}/templates/tavern-sheet-gm.html`
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find("button[name='update-inventory']").click(event => this._updateInventory(event, html));
        html.find("button[name='toggle-show-entry']").click(event => this._toggleShowEntry(event, html));
        html.find("a[name='toggle-show-entry']").click(event => this._toggleShowEntry(event, html));
        html.find("button[name='take-order']").click(event => this._takeOrder(event, html));
        html.find("button[name='refresh-name']").click(event => this._refreshName(event, html));
        html.find("a[name='clear-order']").click(event => this._clearOrder(event, html));
        html.find("button[name='show-order']").click(event => this._showOrder(event, html));
        html.find("button[name='serve-order']").click(event => this._serveOrder(event, html));
        html.find("button[name='charge-order']").click(event => this._chargeOrder(event, html));
        html.find("button[name='sell-order']").click(event => this._sellOrder(event, html));
        html.find("a[name='clear-orders']").click(event => this._clearOrders(event, html));

        html.find("button[name='unlock-innkeeper']").click(event => this._unlockInnkeeper(event, html));
        html.find("button[name='lock-innkeeper']").click(event => this._lockInnkeeper(event, html));

        html.find("button[name='checkout']").click(event => this._checkout(event, html));


        html.find("button[name='delete-category']").click(event => this._deleteCategory(event, html));
        html.find("button[name='add-category']").click(event => this._addCategory(event, html));
        html.find("input[name='category-name']").change(event => this._changeCategory(event, 'name'));
        html.find("input[name='category-roll']").change(event => this._changeCategory(event, 'roll'));

        html.find("select[name='category-rolltable']").change(event => this._changeCategory(event, 'table'));
        html.find("select[name='quality']").change(event => this._changeQuality(event));
        html.find("select[name='buyers']").change(event => this._changeBuyers(event));
        html.find("select[name='template']").change(event => this._selectTemplate(event));


        html.find("input[name='filter-location']").change(event => this._changeFilterLocation(event));
        html.find("input[name='library-keyword']").change(event => this._changeLibraryKeyword(event));


        html.find("input[name='establishment']").change(event => this._changeEstablishment(event));
        html.find("input[name='is-tavern']").change(event => this._changeIsTavern(event));
    }

    playerViewEnabled() {
        return !game.user.isGM || getProperty(this.actor.data.data, "merchant.playerView")
    }

    async getData() {
        if (!this.buyersCount) this.buyersCount = 3
        this.isTavern = this.actor.getFlag(moduleName, 'is-tavern')
        if (this.isTavern === undefined)
            this.isTavern = true
        this.tradeOffer = this.actor.getFlag(moduleName, 'trade-offer') || []
        this.establishment = this.actor.getFlag(moduleName, 'establishment') || TavernSheetDSA5.getRandomEstablishmentName()
        this.roleTables = this.actor.getFlag(moduleName, 'roleTables') || []
        this.qualityOption = this.actor.getFlag(moduleName, 'qualityOption') || 2
        if (!this.rolltableOptions) {
            this.rolltableOptions = []
            for (let pack of game.packs) {
                if (pack.metadata.entity !== 'RollTable')
                    continue
                const packName = pack.metadata.package + '.' + pack.metadata.name
                const content = await pack.getContent()
                for (let tableOption of content)
                    this.rolltableOptions.push({_id: tableOption._id, packName: packName, name: tableOption.data.name})
            }
            this.rolltableOptions = this.rolltableOptions.sort(function (a, b) {
                if (a.name.toLowerCase() < b.name.toLowerCase()) {
                    return -1;
                }
                if (a.name.toLowerCase() > b.name.toLowerCase()) {
                    return 1;
                }
                return 0;
            })
        }

        this.libraryOptions = ["meleeweapon", "armor", "equipment", "poison", "consumable", "rangeweapon"]

        this.rollTableConfig = TavernSheetDSA5.getDefaultSettings().templates

        const data = super.getData();
        mergeObject(data, {
            qualityOptions, priceOptions,
            qualityOption: this.qualityOption,
            rolltableOptions: this.rolltableOptions,
            libraryOptions: this.libraryOptions,
            locked: (this.actor.data.permission.default !== 1),
            roleTables: this.roleTables,
            isTavern: this.isTavern,
            establishment: this.establishment,
            tradeOffer: this.tradeOffer,
            tradeOfferPlayer: this.tradeOffer.filter(o => o.index.find(e => e.show)),
            currentOrder: this.currentOrder,
            subTotal: this.subTotal,
            orderTotal: this.orderTotal,
            buyersCount: this.buyersCount,
            templates: this.rollTableConfig,
            currentTemplateId: this.currentTemplateId || 1,
            bill: this.bill,
        })
        return data;
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

    _togglePlayerview(ev) {
        this.actor.update({"data.merchant.playerView": !getProperty(this.actor.data.data, "merchant.playerView")})
    }

    async _updateInventory(event, html) {
        const qualityOption = this.actor.getFlag(moduleName, 'qualityOption') || 'taverne'
        const quality = qualityOptions.find(q => q.key === qualityOption) || {price: 1}

        let tradeOffer = []
        for (let table of this.roleTables) {
            const [packName, tableId] = table?.table.split(':')
            let rolltable
            if (!packName) {
                return
            } else if (packName === 'libraryItems') {
                const filter = (!table.libraryKeyword || false)
                    ? undefined
                    : (item) => {
                        for (let keyword of table.libraryKeyword.split(','))
                            if ((item.document.data.name && item.document.data.name.toLowerCase().includes(keyword.toLowerCase())) ||
                                (item.document.data.data.description.value && item.document.data.data.description.value.toLowerCase().includes(keyword.toLowerCase())))
                                return true
                        return false
                    }

                //let temp = await getRolltableFromLibrary(tableId, table.filterLocation, filter)
                rolltable = await getFilteredWeightedRolltable({
                    libraryCategory: tableId, filterLocation: table.filterLocation, filter
                })

            } else {
                const filter = (!table.libraryKeyword || false)
                    ? undefined
                    : (item) => {
                        return true
                        /*
                                                for (let keyword of table.libraryKeyword.split(','))
                                                    if ((item.name && item.name.toLowerCase().includes(keyword.toLowerCase())) ||
                                                        (item.data.description?.value && item.data.description.value.toLowerCase().includes(keyword.toLowerCase())))
                                                        return true
                                                return false
                        */
                    }

                rolltable = await getFilteredWeightedRolltable({
                    packName, tableId, filterLocation: table.filterLocation, filter
                })
                //rolltable = await getRolltableFromPack(packName, tableId, table.filterLocation, filter)
            }

            const amount = await rollAmount(table.roll[qualityOption])
            const results = await drawManyWithoutReplacement(rolltable, amount)

            if (rolltable?.name.substr(-10) === '_TEMPORARY')
                rolltable.delete()

            let index = []
            for (let article of results) {
                let itemDetail
                if (article.collection && article.collection !== `string`) {
                    let pack = game.packs.get(article.collection)
                    if (pack)
                        itemDetail = await pack.getEntry(article.resultId)
                }
                if (!itemDetail) {
                    index.push({
                        _id: article.resultId,
                        name: article.text,
                        img: article.img,
                        description: null,
                        price: 0,
                        show: false
                    })
                } else {
                    let description = itemDetail.data?.description?.value
                    index.push({
                        _id: itemDetail._id,
                        name: itemDetail.name,
                        img: itemDetail.img,
                        description,
                        collection: article.collection,
                        price: itemDetail.data?.price.value * (quality.price),
                        show: false
                    })
                }
            }
            tradeOffer.push({
                name: table.name,
                index
            })
        }
        await this.actor.setFlag(moduleName, 'trade-offer', tradeOffer)
    }

    _takeOrder(event, html) {
        const entryId = $(event.currentTarget).attr("data-entry-id")
        if (!this.currentOrder) this.currentOrder = []
        if (!this.subTotal) this.subTotal = 0

        const entry = this._thisFindEntry(entryId)
        if (!entry) return
        this.currentOrder.push(entry)
        this.subTotal += entry.price
        this.render()
    }


    async _checkout(event, html) {
        if (!this.orderTotal)
            return
        const paymentType = $(event.currentTarget).attr("data-payment")
        let content = `<h2>${this.actor.name} bringt euch die Rechnung:</h2>`

        let i = 1
        for (let round of this.bill)
            if (Array.isArray(round)) {
                content += `<h3>${i++}. Runde:</h3>`
                for (let order of round)
                    content += `<p>${order.name} <span style="float:right">${DSA5Payment._moneyToString(order.price)}</span></p>`
            }


        let paymentPrice = this.orderTotal
        content += `<hr/><h3>Macht dann insgesamt: <span style="float:right">${DSA5Payment._moneyToString(this.orderTotal)}</span></h3>`

        if (paymentType === 'dutch') {
            const playerCount = this.buyersCount || 2
            paymentPrice = Math.ceil(this.orderTotal / playerCount * 100) / 100
            content += `<h3><b>Pro Kopf (geteilt durch ${playerCount}):</b> <span style="float:right">${DSA5Payment._moneyToString(paymentPrice)}</span></h3>`
        }


        const paymentChatContent = (price, paymentPrice = null) => {
            let money = DSA5Payment._getPaymoney(price.toString())
            if (!money)
                return
            if (!paymentPrice)
                return `<button class="payButton" data-amount="${money}">${DSA5Payment._moneyToString(money)} bezahlen</button>`

            if ((price - paymentPrice) === 0) return ''

            let tip = Math.floor((price - paymentPrice) / paymentPrice * 100)
            return `<button class="payButton" data-amount="${money}">Auf ${DSA5Payment._moneyToString(money)} aufrunden (${tip}% Trinkgeld)</button>`

            //return `</p>Auf ${DSA5Payment._moneyToString(money)} aufrunden</p><button class="payButton" data-amount="${money}">${tip}% Trinkgeld geben</button>`

        }

        content += paymentChatContent(paymentPrice)
        content += paymentChatContent(Math.ceil(paymentPrice / 10) * 10, paymentPrice)
        content += paymentChatContent(Math.ceil(paymentPrice), paymentPrice)
        content += paymentChatContent(Math.ceil(paymentPrice * 10) / 10, paymentPrice)

        const message = await ChatMessage.create({
            speaker: {alias: this.establishment},
            content
        })
        this.render()
    }

    _toggleShowEntry(event, html) {
        const entryId = $(event.currentTarget).attr("data-entry-id")
        const dataShow = $(event.currentTarget).attr("data-show")
        const toggleAll = (!entryId || entryId === 'all')
        const tradeOffer = this.tradeOffer.map(c => {
            return {
                ...c,
                index: c.index.map(e => !toggleAll && e._id !== entryId ? e : {
                    ...e,
                    show: (dataShow === undefined || dataShow === "toggle") ? !e.show : (dataShow === "true")
                })
            }
        })
        this.actor.setFlag(moduleName, 'trade-offer', tradeOffer)
    }

    _thisFindEntry(entryId) {
        if (!this.tradeOffer || this.tradeOffer === []) return null
        for (let c of this.tradeOffer) {
            let entry = c.index.find(e => e._id === entryId)
            if (entry)
                return entry
        }
        return null
    }

    _clearOrder(event, html) {
        this.currentOrder = []
        this.subTotal = 0
        this.render()
    }

    //todo wrap up flag setter / getter
    _changeQuality(event) {
        this.actor.setFlag(moduleName, 'qualityOption', $(event.currentTarget)[0].value)
    }

    _changeBuyers(event) {
        this.buyersCount = $(event.currentTarget)[0].value
    }

    _changeEstablishment(event) {
        this.actor.setFlag(moduleName, 'establishment', $(event.currentTarget)[0].value)
    }


    async _changeFilterLocation(event) {
        const categoryId = $(event.currentTarget).attr("data-category-id")
        let roleTables = duplicate(this.roleTables);
        roleTables[categoryId].filterLocation = event.currentTarget.checked
        this.actor.setFlag(moduleName, 'roleTables', roleTables)
        this.roleTables = roleTables
        this.render()
    }

    _changeLibraryKeyword(event) {
        const categoryId = $(event.currentTarget).attr("data-category-id")
        let roleTables = duplicate(this.roleTables);
        roleTables[categoryId].libraryKeyword = event.currentTarget.value
        this.actor.setFlag(moduleName, 'roleTables', roleTables)
        this.roleTables = roleTables
    }


    _deleteCategory(event, html) {
        const categoryId = $(event.currentTarget).attr("data-category-id")
        let roleTables = duplicate(this.roleTables);
        roleTables.splice(categoryId, 1)
        this.actor.setFlag(moduleName, 'roleTables', roleTables)
        this.roleTables = roleTables
        this.render()
    }

    _addCategory(event, html) {
        let roleTables = duplicate(this.roleTables);
        roleTables.push({
            roll: {"1": "2d2", "2": "2d3", "3": "3d3", "4": "3d4", "5": "3d5"},
            name: '',
            regionFilter: false,
            libraryKeyword: ''
        })
        this.actor.setFlag(moduleName, 'roleTables', roleTables)
        this.roleTables = roleTables
        this.render()
    }

    async _changeCategory(event, key) {
        let roleTables = duplicate(this.roleTables);

        if (key === 'roll') {
            if (!roleTables[$(event.currentTarget).attr("data-category-id")][key] || Array.isArray(roleTables[$(event.currentTarget).attr("data-category-id")][key]))
                roleTables[$(event.currentTarget).attr("data-category-id")][key] = {}
            roleTables[$(event.currentTarget).attr("data-category-id")][key][$(event.currentTarget).attr("data-quality-key")] = $(event.currentTarget)[0].value
        } else {
            roleTables[$(event.currentTarget).attr("data-category-id")][key] = $(event.currentTarget)[0].value
        }

        this.actor.setFlag(moduleName, 'roleTables', roleTables)
        this.roleTables = roleTables
        this.render()
    }


    async _unlockInnkeeper(event) {
        const perms = this.actor.data.permission
        perms.default = 1
        const result = await this.actor.update({permission: perms})
    }

    async _lockInnkeeper(event) {
        const perms = this.actor.data.permission
        perms.default = 0
        const result = await this.actor.update({permission: perms})
    }

    _showOrder(event, html) {
        let content = `<h2>${this.actor.name} zeigt euch:</h2>`
        for (let entry of this.currentOrder) {
            content += `<p><img src="${entry.img}" style="width: 48px; margin-right: 10px; vertical-align: middle"/><b>${entry.name}</b></p>`
            if (entry.description && entry.description !== null)
                content += `<p>${entry.description}</p>`
        }
        ChatMessage.create({
            speaker: {
                alias: this.establishment
            },
            content
        })
    }

    _serveOrder(event, html) {
        let content = `<h2>${this.actor.name} bringt euch:</h2>`
        for (let entry of this.currentOrder) {
            content += `<p><img src="${entry.img}" style="width: 48px; margin-right: 10px; vertical-align: middle"/><b>${entry.name}</b></p>`
        }
        ChatMessage.create({
            speaker: {
                alias: this.establishment
            },
            content
        })
        this._chargeOrder()
        this.currentOrder = []
        this.subTotal = 0
        this.render()
    }

    _chargeOrder(event, html) {
        if (!this.bill)
            this.bill = []
        if (!this.orderTotal)
            this.orderTotal = 0

        this.bill.push(this.currentOrder)
        this.orderTotal += this.subTotal

        this.currentOrder = []
        this.subTotal = 0
        this.render()
    }

    async _sellOrder(event, html) {
        let money = DSA5Payment._getPaymoney(this.subTotal.toString())
        if (!money)
            return

        let content = `<h2>Danke für Euren Einkauf!</h2>`
        for (let entry of this.currentOrder) {
            content += `@Compendium[${entry.collection}.${entry._id}]{${entry.name}}`
        }

        content += `<p>${game.i18n.format("PAYMENT.paySum", {amount: DSA5Payment._moneyToString(money)})}</p><button class="payButton" data-amount="${money}">${game.i18n.localize("PAYMENT.payButton")}</button>`
        await ChatMessage.create({content})

        this.currentOrder = []
        this.subTotal = 0
        this.render()
    }

    async _clearOrders() {
        this.bill = []
        this.orderTotal = 0
        this.currentOrder = []
        this.subTotal = 0
        this.render()
    }

    static getRandomEstablishmentName() {
        const part1 = ['Zur / Zum', 'In der / Im', 'Die / Der / Das']
        const part2 = ['schwarze', 'weiße', 'bunte', 'rote', 'gelbe', 'blaue', 'silberne', 'goldene', 'graue', 'königliche', 'arme', 'fleißige', 'faule', 'kichernde', 'kreischende', 'herrliche', 'schreckliche', 'geheime', 'löbliche', 'räudige', 'rasende', 'hurtige', 'rauchende', 'qualmende', 'dampfende', 'lärmende', 'stille', 'heulende', 'jaulende', 'wimmernde', 'lachende', 'trübe', 'helle', 'warme', 'kalte', 'dunkle', 'heiße', 'gefrorene', 'dumme', 'schlaue', 'fette', 'dürre', 'tote', 'verwundete', 'betrunkene', 'besoffene', 'letzte', 'erste', 'neue', 'alte', 'rostige', 'hohe', 'tiefe', 'lustige', 'traurige', 'ängstliche', 'mutige', 'muntere', 'freundliche', 'teuflische']
        const part3 = ['Eber', 'Hirsch', 'Eulenbär', 'Drachen', 'Fuchs', 'Affe', 'Hahn', 'Adler', 'Vogel', 'Esel', 'Ferdinand', 'Stiefel', 'Schuh', 'Handschuh', 'Rock', 'Riemen', 'Hut', 'Helm', 'Unterrock', 'Hantel', 'Leuchter', 'Strumpf', 'Rauchfang', 'Amboss', 'Kleiderschrank', 'Schemel', 'Sarg', 'Waschzuber', 'Brunnen', 'Haken', 'Strick', 'Krug', 'Kessel', 'Deckel', 'Topf', 'Henkel', 'Pott', 'Nachttopf', 'Spucknapf', 'Becher', 'König', 'Bettler', 'Müller', 'Schuster', 'Jäger', 'Meister', 'Mönch', 'Diener', 'Abt', 'Priester', 'Kesselflicker', 'Mann', 'Bengel', 'Tempel', 'Tümpel', 'See', 'Sumpf', 'Keller', 'Schmerz', 'Triumph', 'Tod', 'Kerl', 'Taugenichts', 'Reiter', 'Schild', 'Speer', 'Morgenstern', 'Dolch', 'Hammer', 'Bogen', 'Langbogen', 'Dreschflegel', 'Dreizack', 'Oger', 'Troll', 'Ork', 'Goblin', 'Hippogreif', 'Bastard', 'Zwerg', 'Halbling', 'Grubentroll', 'Buckel', 'Gruftschrecken', 'Zombie', 'Einhorn', 'Reh', 'Kaninchen', 'Wildschwein', 'Schwein', 'Huhn', 'Schaf', 'Ross', 'Rössl', 'Hemd', 'Amulett', 'Krönchen', 'Strumpfband', 'Regal', 'Geschirr', 'Becken', 'Brauhaus', 'Badehaus', 'Wäldchen', 'Loch', 'Lieschen', 'Männchen', 'Schlachthaus', 'Glück', 'Unglück', 'Vergessen', 'Schwert', 'Schild', 'Messer', 'Beil', 'Herz', 'Köpfchen', 'Nierchen', 'Haus', 'Fass', 'Weib', 'Brathuhn', 'Löckchen', 'Schreckgespenst', 'Gespenst', 'Skelett', 'Äffchen', 'Zimmer', 'Sau', 'Antilope', 'Fledermaus', 'Maus', 'Ratte', 'Kuh', 'Henne', 'Ziege', 'Fliege', 'Mücke', 'Laus', 'Krone', 'Garderobe', 'Socke', 'Locke', 'Leber', 'Niere', 'Todesfee', 'Vettel', 'Amme', 'Eckbank', 'Bank', 'Treppe', 'Leiter', 'Unterkunft', 'Bleibe', 'Brücke', 'Tasse', 'Pfanne', 'Kelle', 'Bratpfanne', 'Bratröhre', 'Lampe', 'Fackel', 'Kugel', 'Königin', 'Bettlerin', 'Müllerin', 'Meisterin', 'Nonne', 'Äbtissin', 'Frau', 'Magd', 'Küche', 'Brauerei', 'Kirche', 'Badestube', 'Müllerstube', 'Backstube', 'Stube', 'Freude', 'Trauer', 'Liebe', 'Verzweiflung', 'Hoffnung', 'Auferstehung', 'Wiedergeburt', 'Armbrust', 'Glefe', 'Mistgabel', 'Heugabel', 'PeitscheZange', 'Hacke', 'Spitzhacke', 'Reitgerte', 'Angel', 'Rute', 'Lanze', 'Axt', 'Streitaxt', 'Machete']
        const rndArr = arr => arr[Math.floor(Math.random() * arr.length)]
        return `${rndArr(part1)} ${rndArr(part2)} ${rndArr(part3)}`
    }


    static getDefaultSettings() {
        return {
            templates: [
                {
                    name: 'Taverne',
                    isTavern: true,
                    roleTables: [{
                        "roll": {"1": "2d2", "2": "2d3", "3": "3d3", "4": "3d4", "5": "3d5"},
                        "name": "Munition",
                        "regionFilter": false,
                        "libraryKeyword": "",
                        "table": "dsa5-homebrew.rolltable-warenangebot:FYBOWOCqPlpPTERr"
                    }, {
                        "roll": {"1": "2d2", "2": "2d3", "3": "3d3", "4": "3d4", "5": "3d5"},
                        "name": "Nahkampf Waffen",
                        "regionFilter": false,
                        "libraryKeyword": "",
                        "table": "dsa5-homebrew.rolltable-warenangebot:KJnUxxwn6a3MhTPI"
                    }, {
                        "roll": {"1": "2d2", "2": "2d3", "3": "3d3", "4": "3d4", "5": "3d5"},
                        "name": "Schilde",
                        "regionFilter": false,
                        "libraryKeyword": "",
                        "table": "dsa5-homebrew.rolltable-warenangebot:8zlOVUBJEfoWrT9H"
                    }, {
                        "roll": {"1": "2d2", "2": "2d3", "3": "3d3", "4": "3d4", "5": "3d5"},
                        "name": "Fernkampf Waffen",
                        "regionFilter": false,
                        "libraryKeyword": "",
                        "table": "libraryItems:rangeweapon"
                    }]

                },
                {
                    name: 'Waffenschmied',
                    isTavern: false,
                    roleTables: []
                },
                {
                    name: 'Bäckerei',
                    isTavern: false,
                    roleTables: []
                },
                {
                    name: 'Gemischtwaren',
                    isTavern: false,
                    roleTables: []
                },
                {
                    name: 'Schneider',
                    isTavern: false,
                    roleTables: []
                },
                {
                    name: 'Hufschmied',
                    isTavern: false,
                    roleTables: []
                },
            ],
        }
    }

    _refreshName(event, html) {
        let name = TavernSheetDSA5.getRandomEstablishmentName()
        this.actor.setFlag(moduleName, 'establishment', name)
    }

    async _changeIsTavern(event) {
        this.actor.setFlag(moduleName, 'is-tavern', event.currentTarget.checked)
    }

    async _selectTemplate(event) {
        this.currentTemplateId = $(event.currentTarget)[0].value;
        let isTavern = duplicate(this.rollTableConfig[this.currentTemplateId].isTavern);
        this.actor.setFlag(moduleName, 'is-tavern', isTavern)
            .then(() => {
                let roleTables = duplicate(this.rollTableConfig[this.currentTemplateId].roleTables);
                this.actor.setFlag(moduleName, 'roleTables', roleTables)
            })
    }
}



export async function drawManyWithoutReplacement(table, amount) {
    let result = []
    if (!table || !table.data) return result

    if (amount >= table.data.results.length)
        return table.data.results

    while (result.length < amount) {
        let newResult = await table.draw({displayChat: false})
        let duplicate = result.find(r => r._id === newResult.results[0]._id)
        if (duplicate === undefined)
            result.push(newResult.results[0])
    }
    table.reset()
    return result
}


export async function rollAmount(wurf) {
    if (!wurf || wurf === "") return 0
    let roll = new Roll(wurf);
    roll.evaluate();
    return roll.result
}



/**
 * Todo move this to traveller
 */


function checkAvailability(currentLocation, availability, item) {
    // restructure the parameters for later use
    const currentBiomeKey = currentLocation.biome?.key
    const currentRegionKeys = currentLocation.region?.reduce((accumulator, currentValue) => {
        return accumulator.concat(currentValue.index.map(i => i.key))
    }, []) || []
    const generalAvailability = availability.general || 3
    const regionAvailability = Math.max(availability.regions?.filter(e => {
        return currentRegionKeys.includes(e[0])
    }).map(e => e[1]))
    let biome = availability.biomes?.find(e => currentBiomeKey === e[0]) || ['fallback', 5]
    const biomeAvailability = biome[1]
    const result = Math.max(generalAvailability, Math.min(regionAvailability, biomeAvailability))
    return result
}



/**
 * Create temporary Rolltable from the DSA5 Library or another rolltable
 * Filter rolltable result by current location and applicable availability and/or keywords before returning the table
 * @param packName
 * @param tableId
 * @param libraryCategory
 * @param filterLocation
 * @param filter additional filter callback function
 * @return {Promise<*>}
 */
export async function getFilteredWeightedRolltable({packName, tableId, libraryCategory, filterLocation = false, filter}) {

    // get current location as per settings
    const currentLocation = game.settings.get(locationModuleName, 'location')

    // prepare items
    let itemIndex = []
    let getItemData = (e) => e
    if (libraryCategory) {
        // get the complete DSA5 Library and index if that hasn't been done yet
        const itemLibrary = game.dsa5.itemLibrary
        if (!itemLibrary.equipmentBuild) {
            await itemLibrary.buildEquipmentIndex()
        }
        itemIndex = itemLibrary.equipmentIndex.search(libraryCategory, {field: ["itemType"]})
        getItemData = (e) => e.document.data
    } else {
        let packTables = await game.packs.get(packName).getContent()
        itemIndex = duplicate(packTables.find(t => t._id === tableId)?.data.results) || [];
    }

    // create weighted results depending on current location and item location
    let results = []
    for (let entry of itemIndex) {
        let item = entry

        if (!libraryCategory && entry.collection && entry.resultId) {
            let pack = game.packs.get(entry.collection)
            if (!pack)
                continue
            item = await pack.getEntry(entry.resultId)
            if (!item)
                continue
        }


        // additional filter is set and the item doesnt match
        if (typeof filter === 'function' && filter(item) === false)
            continue

        // set probability of this item being available to ddefault
        let weight = INITIAL_WEIGHT

        // we filter by location and we know the current location
        if (filterLocation && currentLocation) {
            // no availability assigned to this item, so we assume its available in general
            if (getItemData(item).data?.availability) {
                weight = checkAvailability(currentLocation, getItemData(item).data.availability, item)
            }
            // item is not available here
            if (!weight || weight < 1)
                continue
        }

        // is the item linked to a compendium?
        let collection = `string`
        let type = 0
        let text = getItemData(item).name
        let resultId = getItemData(item)._id
        if (item.document?.compendium) {
            collection = item.document.compendium.collection
            type = 2
        } else if (entry.collection) {
            collection = entry.collection
            resultId = getItemData(entry).resultId
            text = getItemData(entry).text
            type = 2
        } else if (getItemData(item)._id) {
            collection = "Item"
            type = 1
        }


        // push data to results
        results.push({
            collection,
            weight,
            type,
            text,
            resultId,
            img: getItemData(item).img,
            drawn: false,
            range: [-1, -1],
            flags: {}
        })
    }


    // create temporary rolltable with above results and normalize
    const tableData = {
        name: 'rolltable_TEMPORARY',
        formula: `1d${results.length}`,
        replacement: false,
        displayRoll: true,
        results
    }
    let table = await RollTable.create(tableData)
    await table.normalize()
    return table

}
