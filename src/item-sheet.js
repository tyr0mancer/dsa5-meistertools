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
