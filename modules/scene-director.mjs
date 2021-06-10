import {MeistertoolsLocator} from "../src/locator.js";
import {moduleName, MeistertoolsUtil} from "../meistertools.js";
import defaultSettings from "../config/scenes.config.js";
import {MeisterApplication} from "../util/meister-application.js";
import {FileBrowser} from "../util/file-browser.js";

export class SceneDirector extends MeisterApplication {

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
            width: 740,
            height: 650,
            resizable: true,
            template: `modules/${moduleName}/templates/scene-director.hbs`,
            id: 'meistertools.scenes',
            title: 'Szenen verwalten',
        });
    }

    async getData() {
        this.settings = game.settings.get(moduleName, 'scenes')
        if (!this.activeCollection)
            await this._pickCollection(0)
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
                {source: "folder", name: "In Welt", scenes: this.scenes.folder?.filter(filter) || []},
                {source: "pack", name: "Aus Kompendium", scenes: this.scenes.pack?.filter(filter) || []}
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
            if (sceneSource !== "pack") {
                const scene = await this.scenes[sceneSource].find(s => s._id === sceneId)
                await scene.view()
                return this.close()
            }
            const scene = await game.scenes.importFromCollection(this.activeCollection.collection, sceneId, this.folder ? {folder: this.folder.id} : null)
            if (this.activeCollection.isDynamicMap) {
                const img = $(event.currentTarget).attr("src").replace('-thumbs\/', '\/')
                await scene.update({"img": img})
            }
            await scene.view()
            return this.close()
        })

        html.find(".set-category").click(async event => {
            await this._pickCollection($(event.currentTarget).attr("data-collection-index"))
            this.render()
        })

        html.find("a.reset-playlist").click(() => {
            this.filter.playlist = (game.playlists.playing.length)
                ? game.playlists.playing[0].name
                : ''
            this.render()
        })

        html.find("select[name=playlist]").change(event => {
            this.filter.playlist = event.currentTarget.value
            this.render()
        })

        html.find("a.reset-biome").click(() => {
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

        html.find("a.clear-filter").click(() => {
            this.filter = {}
            this.render()
        })


    }

    async _pickCollection(index = 0) {
        this.activeCollection = this.settings.sceneCollections[index]
        this.folder = await MeistertoolsUtil.getFolder(this.activeCollection.folder, "Scene")
        this.scenes.folder = this.folder.content
        this.pack = game.packs.get(this.activeCollection.collection)
        if (this.activeCollection.isDynamicMap) {
            const content = await this.pack?.getContent()
            this.scenes.pack = []
            for (const templateScene of content) {
                const {name, img, _id} = templateScene
                const biome = templateScene.getFlag("dsa5-meistertools", "biome")
                const playlistName = templateScene.getFlag("dsa5-meistertools", "playlistName")
                const path = img.substring(0, img.lastIndexOf(".")) + '-thumbs';
                const folder = await new FileBrowser().browse(path)
                for (let img of folder.files) {
                    //const match = img.match(/(.*)#(.*)\.webp/g)
                    const scene = {name, data: {img, name, _id}}
                    mergeObject(scene, {data: {flags: {"dsa5-meistertools": {biome, playlistName}}}})
                    this.scenes.pack.push(scene)
                }
            }
        } else {
            this.scenes.pack = await this.pack?.getContent() || []
        }
    }

    /**
     * default settings from config/scenes.config.js
     */
    static get defaultSettings() {
        return defaultSettings
    }

}
