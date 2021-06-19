import {MeistertoolsLocator} from "../src/locator.js";
import {moduleName, Meistertools} from "../meistertools.js";
import defaultSettings from "../config/scenes.config.js";
import {MeisterApplication} from "../util/meister-application.js";
import {FileBrowser} from "../util/file-browser.js";

export default class SceneDirector extends MeisterApplication {

    static get meisterModule() {
        return {name: "Szenenwechsel", icon: "fas fa-map", key: "scene-director", class: SceneDirector}
    }

    constructor(moduleKey = SceneDirector.meisterModule.key) {
        super(moduleKey);
        this.scenes = {}
        this.filter = {playlist: "", keyword: ""}
        Hooks.on(moduleName + ".update-settings", () => this.render())
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['meistertools'],
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
            if (this.filter.onlyNew)
                return !s.inWorld
            return true
        }

        const worldSceneImages = this.scenes.folder.map(f => f.data.img)
        this.scenes.pack = this.scenes.pack.map(p => {
            p.inWorld = worldSceneImages.includes(getSourceFromThumb(p.data.img))
            return p
        })

        return {
            filter: this.filter,
            worldScenes: this.scenes.folder?.filter(filter) || [],
            packScenes: this.scenes.pack?.filter(filter) || [],
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
        Meistertools.addDefaultListeners(html);
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
                const img = getSourceFromThumb($(event.currentTarget).attr("src"))
                await scene.update({"img": img})
            }
            await scene.view()
            await this._reloadCollection()
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

        html.find("input[name=onlyNew]").change(event => {
            this.filter.onlyNew = event.currentTarget.checked
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

    async _reloadCollection() {
        this.folder = await Meistertools.getFolder(this.activeCollection.folder, "Scene")
        this.scenes.folder = this.folder.content
        this.pack = game.packs.get(this.activeCollection.collection)
        this.scenes.pack = []
        if (this.activeCollection.isDynamicMap) {
            const content = await this.pack?.getContent()
            for (const templateScene of content) {
                const {name, img, _id} = templateScene
                const biome = templateScene.getFlag("dsa5-meistertools", "biome")
                const playlistName = templateScene.getFlag("dsa5-meistertools", "playlistName")
                const path = img.substring(0, img.lastIndexOf(".")) + '-thumbs';
                const folder = await new FileBrowser().browse(path)
                for (let img of folder.files) {
                    const {name: tmpName, keywords} = getKeyAndName(img)
                    const scene = {
                        name: `${name} ${keywords} ${tmpName}`,
                        data: {img, name: `${name} - ${keywords || tmpName}`, _id}
                    }
                    mergeObject(scene, {data: {flags: {"dsa5-meistertools": {biome, playlistName}}}})
                    this.scenes.pack.push(scene)
                }
            }
        } else {
            this.scenes.pack = await this.pack?.getContent() || []
        }
    }


    async _pickCollection(index = 0) {
        this.activeCollection = this.settings.sceneCollections[index]
        await this._reloadCollection()
    }

    /**
     * default settings from config/scenes.config.js
     */
    static get defaultSettings() {
        return defaultSettings
    }

}

const regex1 = /((.*)\/)*(.*)[%23|#](.*)\.(.*)/
const regex2 = /((.*)\/)*(.*)\.(.*)/
const getKeyAndName = (str) => {
    const match1 = regex1.exec(str);
    if (match1)
        return {name: match1[3], keywords: match1[4]}
    const match2 = regex2.exec(str);
    if (match2)
        return {name: match2[3], keywords: ""}
    return {}
}

const regex = /(.*)(%23|#)(.*)\.(.*)/
const getSourceFromThumb = (str2) => {
    const str = str2.replace('-thumbs\/', '\/')
    const match = regex.exec(str);
    return match ? `${match[1]}.${match[4]}` : str
}
