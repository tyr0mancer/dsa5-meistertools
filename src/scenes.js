import {moduleName, MeistertoolsUtil} from "../meistertools.js";
import defaultSettings from "../config/scenes.config.js";
import {MeistertoolsLocator} from "./locator.js";

export class Scenes extends Application {
    isOpen = false

    toggle() {
        if (this.isOpen)
            this.close()
        else
            this.render(true)
        this.isOpen = !this.isOpen
    }

    constructor() {
        super();
        this.scenes = {}
        this.filter = {playlist: "", keyword: ""}
        Hooks.on(moduleName + ".update-settings", () => this.render())
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['meistertools'],
            top: 50,
            left: 100,
            width: 720,
            height: 650,
            resizable: true,
            template: `modules/${moduleName}/templates/scenes.hbs`,
            id: 'meistertools.scenes',
            title: 'Szenen verwalten',
        });
    }

    async getData() {
        this.settings = game.settings.get(moduleName, 'scenes')
        if (!this.activeCollection)
            await this._pickCollection(this.settings.sceneCollections[0]?.collection)
        const filter = (s) => {
            if (this.filter.keyword && !s.name.toLowerCase().includes(this.filter.keyword.toLowerCase()))
                return false

            if (this.filter.biome && this.filter.biome !== s.data.flags[moduleName]?.biome?.key)
                return false

            if (this.filter.playlist)
                return this.filter.playlist === s.data.flags[moduleName]?.playlistName
            return true
        }
        return {
            filter: this.filter,
            scenes: [
                {source: "folder", name: "Szenen in Ordner", scenes: this.scenes.folder.filter(filter)},
                {source: "pack", name: "Szenen in Kompendium", scenes: this.scenes.pack.filter(filter)}
            ],
            activeCollection: this.activeCollection,
            selectOptions: {
                sceneCollections: this.settings.sceneCollections,
                biomes: game.settings.get(moduleName, "locations").biomes,
                keywords: this.activeCollection.keywords ? this.activeCollection.keywords.split(",") : [],
                playlists: game.playlists.entities.map(p => p.name),
            }
        }
    }

    activateListeners(html) {
        super.activateListeners(html);
        MeistertoolsUtil.addDefaultListeners(html);
        html.find(".scene-thumb").click(async event => {
            const sceneId = $(event.currentTarget).attr("data-scene-id")
            const sceneSource = $(event.currentTarget).attr("data-scene-source")

            const scene = (sceneSource === "pack")
                ? await game.scenes.importFromCollection(this.activeCollection.collection, sceneId, this.folder ? {folder: this.folder.id} : null)
                : await this.scenes[sceneSource].find(s => s.id === sceneId)
            await scene.view()
            this.close()
        })

        html.find(".set-category").click(async event => {
            await this._pickCollection($(event.currentTarget).attr("data-collection"))
            this.render()
        })

        html.find("select[name=playlist]").change(event => {
            this.filter.playlist = event.currentTarget.value
            this.render()
        })

        html.find("button[name=reset-biome]").click(() => {
            this.filter.biome = MeistertoolsLocator.currentLocation.currentBiome.key
            this.render()
        })

        html.find("select[name=biome]").change(event => {
            this.filter.biome = event.currentTarget.value
            this.render()
        })

        html.find("input[name=keyword]").change(event => {
            this.filter.keyword = event.currentTarget.value
            this.render()
        })

        html.find("a.set-keyword").click(event => {
            this.filter.keyword = $(event.currentTarget).attr("data-keyword")
            this.render()
        })

        html.find("button[name=clear-filter]").click(() => {
            this.filter = {}
            this.render()
        })



    }

    async _pickCollection(collection) {
        this.activeCollection = this.settings.sceneCollections.find(c => c.collection === collection)

        if (this.activeCollection.folder)
            this.folder = game.folders.find(f => f.id === this.activeCollection.folder)
        else
            this.folder = await MeistertoolsUtil.getFolder(this.activeCollection.folderName, "Scene")
        this.scenes.folder = this.folder.content

        this.pack = game.packs.get(collection)
        this.scenes.pack = await this.pack.getContent()
    }

    /**
     * default settings from config/scenes.config.js
     */
    static get defaultSettings() {
        return defaultSettings
    }

}
