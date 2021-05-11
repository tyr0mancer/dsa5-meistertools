import {moduleName} from "./meistertools.js";

export class Dsa5Probability {

    /**
     * returns default location from settings
     * @return {{regions: [{catKey: string, catName: string, name: string, key: string}], biome: {name: string, key: string}}}
     */
    static get currentDefaultLocation() {
        return {regions: [{key: '', name: '', catKey: '', catName: ''}], biome: {key: '', name: ''}}
    }

    /**
     * returns all regions from settings
     * @return {{catKey: string, catName: string, name: string, key: string}[]}
     */
    static get regions() {
        return [{key: '', name: '', catKey: '', catName: ''}]
    }

    /**
     * returns all biomes from settings
     * @return {{name: string, key: string}[]}
     */
    static get biomes() {
        return [{key: '', name: ''}]
    }

    /**
     *
     * @param entity Entity of which the probability info is to check from
     * @return {Error|{general: {value: number}, current: {value: number}, regions: [{catKey: string, catName: string, name: string, value: number, key: string}, {catKey: string, catName: string, name: string, value: number, key: string}], biomes: [{name: string, value: number, key: string}]}}
     */
    static getItemProbability(entity) {
        if (!entity) return new Error(moduleName + ' entity is not defined')
        /*
        item: entity.data.data.probability || entity.data.probability || {}
        token: entity.getFlag(moduleName, probability)
        */
        return {
            current: {value: -1},
            general: {value: 3},
            regions: [
                {value: 3, key: 'albernia', name: 'Albernia', catKey: 'politics', catName: 'Politisch'},
                {value: -1, key: 'nostria', name: 'Nostria', catKey: 'politics', catName: 'Politisch'}
            ],
            biomes: [{
                value: 5, key: 'stadt', name: 'Stadt',
            }]
        }
    }

    /**
     * calculate the current probability based on the entity and location.
     * updates entity and returns value
     * @param entity
     * @param location
     * @return {Promise<{value: number}>}
     */
    static async calculateCurrentProbability(entity=null, location = this.currentDefaultLocation) {
        if (entity === null) return Promise.reject(moduleName + ' entity is not defined')
        return {value: 3}
    }


}
