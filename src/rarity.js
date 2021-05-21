import {moduleName} from "../meistertools.js";
import {MeistertoolsLocator} from "./locator.js";

export class MeistertoolsRarity extends Application {
    constructor() {
        super();
        this.entities = []
        this.filter = () => true
        this.sorter = (a, b) => 0
        this.mapper = (e) => {
            return {
                _id: e._id,
                name: e.name,
                img: e.img,
                availability: e.data.data.availability,
                rarity: e.data.data.rarity
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
            entities: this.entities.filter(this.filter).sort(this.sorter).map(this.mapper),
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

        html.find("button.update-current-rarity").click(() => {

        })


        html.find("td.apply-tag").click(async event => {
            const entityId = $(event.currentTarget).attr("data-id")
            /*
                const entity = this.entities.find(e => e._id === entityId)
                await entity.update({"data.availability": {current: 17}})
            */

            this.entities.find(e => e._id === entityId)?.update({"data.availability": {current: 29}})
            this.render(true)
        })
    }


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
        /*
                console.clear()
        */
        this.render()
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


