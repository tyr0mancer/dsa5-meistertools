import ItemSheetdsa5 from "../../../systems/dsa5/modules/item/item-sheet.js";
import DSA5 from "../../../systems/dsa5/modules/system/config-dsa5.js"
import {moduleName} from "../meistertools.js";

export class ItemRegionDSA5 extends ItemSheetdsa5 {
    constructor(item, options) {
        options.width = 530
        options.height = 570
        super(item, options);
        this.mce = null;
    }

    get template() {
        return `modules/${moduleName}/templates/item-sheet-region.hbs`
    }

    async getData(options) {
        const data = await super.getData(options);
        data['regionTypes'] = regionTypes;
        return data
    }

}


export class ItemAvailabilityDSA5 extends ItemSheetdsa5 {
    constructor(item, options) {
        options.width = 530
        options.height = 570
        super(item, options);
        this.mce = null;
    }

    get template() {
        return `modules/${moduleName}/templates/item-sheet.hbs`
    }

    async updateRarity({name, key, category, img, value}) {
        if (!key) return
        let {general, regions, biomes} = this.item.data.data.rarity || {general: 3, regions: [], biomes: []}
        const array = (category === "biome") ? biomes : regions
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
        await this.item.update({"data.rarity": duplicate({general, regions, biomes})})
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

    activateListeners(html) {
        super.activateListeners(html);
        this.form.ondrop = ev => this._onDrop(ev);
        html.find("a.update-rarity").mousedown(async event => {
            const key = $(event.currentTarget).attr("data-entry-key")
            const category = $(event.currentTarget).attr("data-entry-category") || "biome"
            const value = (event.which === 3) ? -1 : 1
            await this.updateRarity({key, category, value})
        })
    }

    async getData(options) {
        const data = await super.getData(options);
        data['equipmentTypes'] = DSA5.equipmentTypes;
        data['rarityOptions'] = rarityOptions;
        return data
    }

}


const rarityOptions = {
    "": "Availability.unknown",
    0: "Availability.none",
    1: "Availability.very-rare",
    2: "Availability.rare",
    3: "Availability.normal",
    4: "Availability.common",
    5: "Availability.very-common",
};

const regionTypes = {
    "city": "Region.city",
    "province": "Region.province",
    "realm": "Region.realm",
    "biome": "Region.biome",
};
