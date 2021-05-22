import {moduleName} from "../meistertools.js";
import {MeistertoolsLocator, LocationPicker} from "./locator.js";

export class MeistertoolsRarity extends Application {
    constructor(tagPropertyName = 'rarity', tagPropertyPath = 'data.rarity') {
        super();
        this.tagPropertyName = tagPropertyName
        this.tagPropertyPath = tagPropertyPath

        this.settings = {locations: game.settings.get(moduleName, 'locations')}
        this.entities = []
        this.showDescription = false
        this.currentFilter = {}
        this.currentTag = {general: MeistertoolsRarity.defaultRarity}
        this.filter = () => true
        this.sorter = (a, b) => 0
        this.mapper = (e) => {
            return {
                _id: e._id,
                name: e.name,
                img: e.img,
                description: e.data.data.description.value,
                rarity: MeistertoolsRarity.cleanRarity(e.data?.data?.rarity)
            }
        }
        this.entityType = "Item"
        this.currentLocation = MeistertoolsLocator.currentLocationExpanded
        Hooks.on(moduleName + ".update-location", (newLocation) => {
            this.currentLocation.currentBiome = newLocation.currentBiome
            this.currentLocation.currentRegions = MeistertoolsLocator.expandRegions(newLocation.currentRegions)
            this.render()
        });
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['meistertools'],
            top: 50,
            left: 50,
            width: 1000,
            height: 800,
            resizable: true,
            template: `modules/${moduleName}/templates/entity-tagger.hbs`,
            id: 'meistertools.rarity',
            title: 'Items verwalten',
            tabs: [{navSelector: ".tabs", contentSelector: ".content", initial: "nsc"}]
        });
    }

    async getData() {
        return {
            currentLocation: this.currentLocation,
            dataSourceSelection: this.dataSourceSelection,
            entities: this.entities.map(this.mapper).filter(this.filter).sort(this.sorter),
            filter: this.currentFilter,
            showDescription: this.showDescription,
            currentTag: this.currentTag,
            options: {
                lockedCollections: game.packs.filter(p => p.entity === this.entityType && p.locked),
                unlockedCollections: game.packs.filter(p => p.entity === this.entityType && !p.locked),
                itemFolders: game.folders.filter(f => f.type === this.entityType),
            }
        }
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find("select[data-source]").change(event => this._setDataSource(event))
        html.find("a.pick-location").click(() => this._pickLocation())

        html.find("a.pick-current-location").click(() => {
                this.currentTag = {
                    general: 3,
                    regions: MeistertoolsLocator.currentLocation.currentRegions.map(r => {
                        return {...r, value: MeistertoolsRarity.defaultRarity}
                    }),
                    biomes: [{
                        ...MeistertoolsLocator.currentLocation.currentBiome,
                        value: MeistertoolsRarity.defaultRarity
                    }]
                }
                this.render()
            }
        )

        html.find("a.calculate-current-rarity").click(() => {

        })


        html.find(".entity-tag").mousedown((event) => {
            const entityId = $(event.currentTarget).attr("data-id")
            const entity = this.entities.find(e => e._id === entityId)
            if (!entity) return
            if (event.which === 3) // right click
                return this._readTag(entity)
            return this._applyTag(entity)
        })


        html.find("a.toggle-description").click(() => {
            this.showDescription = !this.showDescription
            this.render()
        })

        html.find("a.tag").mousedown((event) => {
            const regionKey = $(event.currentTarget).attr("data-region-key")
            const biomeKey = $(event.currentTarget).attr("data-biome-key")
            const delta = (event.which === 3) ? -1 : 1

            function updateValue(value, delta) {
                let result = parseInt(value) + delta
                if (result > MeistertoolsRarity.maxRarity) result = MeistertoolsRarity.maxRarity
                return result
            }

            if (regionKey) {
                const region = this.currentTag.regions.find(r => r.key === regionKey)
                region.value = updateValue(region.value, delta)
                if (region.value < 0)
                    this.currentTag.regions = this.currentTag.regions.filter(r => r.key !== regionKey)
            }
            if (biomeKey) {
                const biome = this.currentTag.biomes.find(b => b.key === biomeKey)
                biome.value = updateValue(biome.value, delta)
                if (biome.value < 0)
                    this.currentTag.biomes = this.currentTag.biomes.filter(b => b.key !== biomeKey)
            }
            if (!biomeKey && !regionKey) {
                this.currentTag.general = updateValue(this.currentTag.general, delta)
                if (this.currentTag.general < 0) this.currentTag.general = 0
            }
            return this.render()
        })


        html.find("input.filter").change(event => {
            const filterName = event.currentTarget.name
            const filterValue = (event.currentTarget.type === "checkbox") ? event.currentTarget.checked : event.currentTarget.value
            this.currentFilter[filterName] = filterValue
            this.filter = (e) => e[filterName].toLowerCase().includes(filterValue.toLowerCase())
            this.render()
        })

    }


    _readTag(entity) {
        mergeObject(this.currentTag, MeistertoolsRarity.cleanRarity(entity.data.data.rarity))
        this.render()
    }

    async _applyTag(entity) {
        await entity.update({[this.tagPropertyPath]: duplicate(this.currentTag)})
        this.render()
    }

    _pickLocation() {
        new LocationPicker((regions, biomes) => {
            this.currentTag.regions = regions.map(r => {
                return {
                    ...r,
                    value: this.currentTag.regions?.find(e => r.key === e.key)?.value || MeistertoolsRarity.defaultRarity
                }
            })
            this.currentTag.biomes = biomes.map(b => {
                return {
                    ...b,
                    value: this.currentTag.biomes?.find(e => b.key === e.key)?.value || MeistertoolsRarity.defaultRarity
                }
            })
            this.render()
        }, {selectedRegions: this.currentTag.regions, selectedBiomes: this.currentTag.biomes}, true).render(true)
    }


    /**
     *
     * @param event
     * @return {Promise<void>}
     * @private
     */
    async _setDataSource(event) {
        this.dataSourceSelection = event.currentTarget.value
        const dataSource = $(event.currentTarget).attr("data-source")
        if (dataSource === "folder") {
            const folder = game.folders.find(f => f.type === this.entityType && f._id === event.currentTarget.value)
            this.entities = folder?.content || []
        }
        if (dataSource === "collection") {
            const pack = game.packs.get(event.currentTarget.value)
            this.entities = await pack.getContent()
        }
        this.render()
    }


    static get maxRarity() {
        return 5
    }

    static get defaultRarity() {
        return 3
    }

    static get rarityOptions() {
        return [
            {key: 0, short: "nie", name: 'nie'},
            {key: 1, short: "1/5", name: 'fast nie'},
            {key: 2, short: "2/5", name: 'selten'},
            {key: 3, short: "3/5", name: 'normal'},
            {key: 4, short: "4/5", name: 'oft'},
            {key: 5, short: "5/5", name: 'sehr oft'}
        ]
    }

    static rarityDescription(rarity = this.defaultRarity) {
        return this.rarityOptions.find(e => e.key === rarity).name
    }

    static cleanRarity(rarity) {
        if (!rarity) return {general: this.defaultRarity}
        return {
            general: (rarity.general !== undefined) ? parseInt(rarity.general) : this.defaultRarity,
            regions: (!Array.isArray(rarity.regions)) ? [] : rarity.regions
                .map(r => {
                    return {value: this.defaultRarity, ...r}
                })
                .filter(r => r.key !== undefined),
            biomes: (!Array.isArray(rarity.biomes)) ? [] : rarity.biomes
                .map(b => {
                    return {value: this.defaultRarity, ...b}
                })
                .filter(b => b.key !== undefined),
        }
    }

}
