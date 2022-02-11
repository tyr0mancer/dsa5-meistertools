import ItemSheetdsa5 from "../../../systems/dsa5/modules/item/item-sheet.js";
import DSA5 from "../../../systems/dsa5/modules/system/config-dsa5.js"
import {moduleName} from "../meistertools.js";
import {MeistertoolsRarity} from "./rarity.js";
import {MeistertoolsLocator} from "./locator.js";

export class LocationSheet extends ItemSheetdsa5 {
    constructor(item, options) {
        options.width = 530
        options.height = 570
        super(item, options);
    }

    get template() {
        return `modules/${moduleName}/templates/item/location-sheet.hbs`
    }

    async getData(options) {
        const data = await super.getData(options);
        data['regionTypes'] = MeistertoolsRarity.regionTypes;
        return data
    }

    activateListeners(html) {
        super.activateListeners(html);
        this.form.ondrop = ev => this._onDrop(ev);
    }

    async _onDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        const {id, type} = JSON.parse(event.dataTransfer.getData('text/plain'));
        if (type !== "Item") return
        const item = game.items.get(id)
        const key = item.data.data.location?.key?.value
        const category = item.data.data.location?.category?.value
        if (!key || category !== "biome") return
        await this.item.update({"data.location.modifier.biome.value": key})
    }

}


export class EquipmentRaritySheet extends ItemSheetdsa5 {
    constructor(item, options) {
        options.width = 530
        options.height = 570
        super(item, options);
        Hooks.on(moduleName + ".update-location", () => this._updateCurrentRarity());
    }

    get template() {
        return `modules/${moduleName}/templates/item/equipment-rarity-sheet.hbs`
    }

    async updateRarity({name, key, category, img, value}) {
        if (!key) return
        let {general, regions, biomes} = this.item.data.data.rarity || {general: 3, regions: [], biomes: []}
        if (!regions) regions = []
        if (!biomes) biomes = []
        if (key === "general") {
            if (value < 0 && !general)
                general = ""
            else if (general === undefined || general === "")
                general = MeistertoolsRarity.defaultRarity
            else {
                general = parseInt(general) + value || 0
                if (general > 5) general = 5
                if (general < 0) general = ""
            }
        } else {
            let array = (category === "biome") ? biomes : regions
            const existingElem = array.find(e => e.key === key)
            if (existingElem) {
                existingElem.value = (parseInt(existingElem.value) || 0) + value
                if (existingElem.value > 5) existingElem.value = 5
                if (existingElem.value < 0) {
                    if (category === "biome")
                        biomes = biomes.filter(e => e.key !== key)
                    else
                        regions = regions.filter(e => e.key !== key)
                }
            } else {
                if (!name) return
                if (category === "biome")
                    biomes.push({name, key, img, value: 3})
                else
                    regions.push({name, key, category, value: 3})
            }
        }
        await this.item.update({"data.rarity": duplicate({general, regions, biomes})})
        await this._updateCurrentRarity()
    }

    async _onDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        const {id, type} = JSON.parse(event.dataTransfer.getData('text/plain'));
        if (type !== "Item") return
        const item = game.items.get(id)
        const {name, img} = item
        const key = item.data.data.regionKey?.value
        const category = item.data.data.regionType?.value
        if (!key) return
        await this.updateRarity({name, key, category, img, value: 1})
    }

    async _updateCurrentRarity() {
        this.currentRarity = await MeistertoolsRarity.calculateRarity(this.item)
        this.render()
    }

    activateListeners(html) {
        super.activateListeners(html);
        this.form.ondrop = ev => this._onDrop(ev);
        html.find("a.update-rarity").mousedown(async event => {
            const key = $(event.currentTarget).attr("data-entry-key")
            const category = $(event.currentTarget).attr("data-entry-category") || "biome"
            const value = (event.which === 3) ? -1 : 1
            await this.updateRarity({key, category, value})
        })

        html.find("a.reset-rarity").click(async () => {
            //await this.item.update({"data.rarity": []})
            await this.item.update({"data.rarity": {general: null, regions: [], biomes: []}})
            await this._updateCurrentRarity()
        })

        html.find("a.reset-general-rarity").click(async () => {
            await this.item.update({"data.rarity.general": null})
            await this._updateCurrentRarity()
        })

        html.find("a.reset-regions-rarity").click(async () => {
            await this.item.update({"data.rarity.regions": []})
            await this._updateCurrentRarity()
        })

        html.find("a.reset-biomes-rarity").click(async () => {
            await this.item.update({"data.rarity.biomes": []})
            await this._updateCurrentRarity()
        })

        html.find("button.calculate-rarity").click(() => this._updateCurrentRarity())
    }

    async getData(options) {
        const data = await super.getData(options);
        if (!data.data.rarity) data.data.rarity = {}
        data.data.rarity.regions = data.data.rarity?.regions?.sort((a, b) => b.value - a.value) || []
        data.data.rarity.biomes = data.data.rarity?.biomes?.sort((a, b) => b.value - a.value) || []

        data['equipmentTypes'] = DSA5.equipmentTypes;
        data['currentLocation'] = MeistertoolsLocator.currentLocationExpanded

        if (!this.currentRarity)
            this.currentRarity = await MeistertoolsRarity.calculateRarity(this.item)
        data['currentRarity'] = this.currentRarity;

        return data
    }

}
