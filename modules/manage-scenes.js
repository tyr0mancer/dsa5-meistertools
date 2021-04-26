import {moduleName} from "../meistertools.js";
import {MeistertoolsUtil, MyCompendia, MyFilePicker} from "../meistertools-util.js";

const SHOW_ALL = 'SHOW_ALL'

export class ManageScenes extends Application {

    static getDefaultSettings() {
        return {
            activateDefault: true,
            updatePlaylist: false,
            defaultPlaylist: '',
            filterExisting: false,
            categories: []
        }
    }

    constructor() {
        super();
        /* read settings */
        const {scenes: settings} = game.settings.get(moduleName, 'settings')
        this.settings = settings

        /* prepare data which we will extract from the various compendia */
        this.myCompendia = new MyCompendia()
        for (let pack of this.settings.categories) {
            this.myCompendia.add({
                name: pack.name,
                packName: pack.packname,
                folderName: pack.folder,
                meta: {
                    addPlayers: pack.addplayers,
                    positionPlayer: pack.position,
                    keywords: pack.keywords
                }
            })
        }

        this.activateScene = this.settings.activateDefault
        this.keyword = ''
        this.activeCategory = null
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = `Manage Scenes`;
        options.id = `${moduleName}.manage-scenes`;
        options.template = `modules/${moduleName}/templates/manage-scenes.html`;
        options.tabs = [{navSelector: ".tabs", contentSelector: ".content", initial: "scene-0"}]

        options.resizable = true;
        options.top = 80;
        options.left = 100;
        options.width = 600;
        options.height = 800;
        return options;
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('a.set-category').click(event => this._setCategory(event));
        html.find('input[name=keyword]').change(event => this._changeKeyword(event));
        html.find('button[name=set-keyword]').click(event => this._changeKeyword(event));


        html.find('button[name=activate-scene]').click(event => this._activateScene(event));
        html.find('.show-scene').click(event => this._showScene(event));


    }


    async getData() {
        // updates only once
        await this.myCompendia.update()

        // available categories
        const categories = this.myCompendia.getCollectionIndex().map(pack => {
            return {name: pack.name, key: pack.key,}
        })
        if (!this.activeCategory)
            this.activeCategory = categories[0].key

        // filter scenes by navigation and keyword
        let scenePack = this.myCompendia.getCollectionIndex('global', this.activeCategory)

        const filterKeyword = (entry) => {
            if (!this.keyword || this.keyword === SHOW_ALL) return true
            return entry.name.toLowerCase().includes(this.keyword.toLowerCase())
        }

        if (scenePack)
            scenePack = {
                ...scenePack,
                index: scenePack.index?.filter(filterKeyword),
                existing: scenePack.existing?.filter(filterKeyword),
            }
        else
            scenePack = {}

        return {
            activateScene: this.activateScene,
            keyword: this.keyword,
            keywords: scenePack.meta.keywords.split(','),
            showAll: SHOW_ALL,
            activeCategory: this.activeCategory,
            settings: this.settings,
            categories, scenePack
        };
    }


    _setCategory(event) {
        this.activeCategory = $(event.currentTarget).attr("data-category-key")
        this.render()
    }

    _changeKeyword(event) {
        if (event.currentTarget.value)
            this.keyword = event.currentTarget.value
        else
            this.keyword = $(event.currentTarget).attr("data-keyword")
        this.render()
    }

    async _showScene(event) {
        const sceneId = $(event.currentTarget).attr("data-scene-id")
        const scene = await this.myCompendia.getEntities(sceneId, 'global', this.activeCategory)
        scene.view()
        this.close()
    }

    async _activateScene(event) {
        const sceneId = $(event.currentTarget).attr("data-scene-id")
        const scene = await this.myCompendia.getEntities(sceneId, 'global', this.activeCategory)
        scene.activate()
        this.close()
    }
}
