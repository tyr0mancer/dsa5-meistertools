import {moduleName} from "../meistertools.js";
import {MeistertoolsLocator, RegionPicker} from "./locator.js";

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
            const result = {
                _id: e._id,
                name: e.name,
                img: e.img,
            }
            result[this.tagPropertyName] = e.data.data[this.tagPropertyName]
            return result
        }
        this.entityType = "Item"
        this.currentLocation = MeistertoolsLocator.currentLocationExpanded
        Hooks.on(moduleName + ".update-location", (newLocation) => {
            console.log(newLocation)
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
            entities: this.entities.filter(this.filter).sort(this.sorter).map(this.mapper),
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
        html.find("button.pick-region").click(() => this._pickRegion())


        html.find("button.update-current-rarity").click(() => {
            this.entities.filter(this.filter).forEach(async entity => {
                /*
                                const {availability} = entity.data.data
                                if (!availability) return
                                const rarity = {
                                    current: undefined,
                                    general: availability.general,
                                    biomes: availability.biomes?.map(([key, value]) => {
                                        return {
                                            key: key,
                                            value: value,
                                            ...this.settings.locations.biomes.find(b => b.key === key),
                                        }
                                    }),
                                    regions: availability.regions?.map(([key, value]) => {
                                        return {
                                            key: key,
                                            value: value,
                                            ...this.settings.locations.regions.find(r => r.key === key),
                                        }
                                    })
                                }
                                const newVal = duplicate(rarity)
                                await entity.update({"data.availability": null, "data.rarity": newVal})
                                this.render()
                */
            })
        })


        html.find("tr.entity-list").mousedown((event) => {
            const entityId = $(event.currentTarget).attr("data-id")
            const entity = this.entities.find(e => e._id === entityId)
            if (!entity) return
            if (event.which === 3) // right click
                return this._readTag(entity)
            return this._applyTag(entity)
        })


        function updateValue(value, delta) {
            let result = parseInt(value) + delta
            if (result < 0) result = 0
            if (result > MeistertoolsRarity.maxRarity) result = MeistertoolsRarity.maxRarity
            return result
        }

        html.find("a.tag").mousedown((event) => {
            const regionKey = $(event.currentTarget).attr("data-region-key")
            const biomeKey = $(event.currentTarget).attr("data-biome-key")
            const delta = (event.which === 3) ? -1 : 1


            if (regionKey) {
                const region = this.currentTag.regions.find(r => r.key === regionKey)
                region.value = updateValue(region.value, delta)
            }

            if (biomeKey)
                updateValue(this.currentTag.biomes.find(r => r.key === biomeKey).value, delta)
            if (!biomeKey && !regionKey)
                this.currentTag.general = updateValue(this.currentTag.general, delta)
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
        this.currentTag = duplicate(entity.data.data[this.tagPropertyName])
        this.render()
    }

    async _applyTag(entity) {
        await entity.update({[this.tagPropertyPath]: duplicate(this.currentTag)})
        this.render()
    }

    _pickRegion() {
        new RegionPicker((regions) => {
            console.log(this.currentTag.regions)
            this.currentTag.regions = regions.map(r => {
                return {...r, value: MeistertoolsRarity.defaultRarity}
            })
            this.render()
        }, {currentRegions: this.currentTag.regions}).render(true)
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


}


