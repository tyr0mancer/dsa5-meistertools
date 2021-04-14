import {moduleName} from '../dsa5-meistertools.js'

const SHOW_ALL = 'SHOW_ALL'

export class ManageScenes extends Application {

    constructor() {
        super();
        this.settings = game.settings.get(moduleName, 'settings')
        const packNames = this.settings.scenes.categories.map(c => c.packname)
        this.packList = game.packs.filter(p => (p.metadata.entity === 'Scene' && packNames.includes(p.metadata.package + '.' + p.metadata.name)))
        this.packListIndexed = false
        this.keyword = ''
        this.activateScene = this.settings.scenes.activateDefault
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = `Manage Scenes`;
        options.id = `${moduleName}.manage-scenes`;
        options.template = `modules/${moduleName}/templates/manage-scene.html`;
        options.tabs = [{navSelector: ".tabs", contentSelector: ".content", initial: "scene-0"}]

        options.resizable = true;
        options.top = 80;
        options.left = 100;
        options.width = 300;
        options.height = 800;
        return options;
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('input[class=\'set-search\']').focus()
        html.find('.set-search').change(ev => this._changeSetting(ev));
        html.find('.set-search-button').click(ev => this._changeSetting(ev));
        html.find('.set-active-default').change(ev => this._setActiveDefault(ev));
        html.find('.set-addplayers').change(ev => this._setAddPlayers(ev));
        html.find('.select-scene').click(ev => this._selectScene(ev));
        html.find('.import-scene').click(ev => this._importScene(ev));
    }


    async getData() {

        // get index array from scene packs if not done already
        if (!this.packListIndexed) {
            console.log('indexing packs')
            for (let pack of this.packList)
                await pack.getIndex()
            this.packListIndexed = true
        }
        //console.log(JSON.stringify(game.folders.entities))

        this.sceneCategories = this.settings.scenes.categories.map(scene => {
                const existingScenes = game.folders.entities
                    .find(f => (f.name === scene.folder && f.type === "Scene"))?.content
                    .map(scene => {
                        return {
                            _id: scene._id,
                            img: scene._data.img,
                            name: scene._data.name,
                        }
                    })
                    .filter(scene => (!this.settings.scenes.filterExisting || this.keyword === SHOW_ALL || (this.keyword !== '' && scene.name.toLowerCase().includes(this.keyword.toLowerCase())))) || []
                const scenesFromPack = this.packList.find(p => (p.metadata.package + '.' + p.metadata.name === scene.packname)).index
                    .filter(scene => (this.keyword === SHOW_ALL || (this.keyword !== '' && scene.name.toLowerCase().includes(this.keyword.toLowerCase())))) || []
                return {
                    ...scene,
                    keywords: scene.keywords.split(','),
                    showAllString: SHOW_ALL,
                    scenesFromPack,
                    existingScenes
                }
            }
        )

        return {
            keyword: (this.keyword !== SHOW_ALL) ? this.keyword : '',
            filterExisting: this.settings.scenes.filterExisting,
            activateScene: this.activateScene,
            sceneCategories: this.sceneCategories
        };
    }

    async _changeSetting(ev) {
        this.keyword = ev.target.value
        await this.rerender();
    }

    async _setActiveDefault(ev) {
        this.activateScene = !this.activateScene
        await this.rerender();
    }

    async _setAddPlayers(ev) {
        //this.addplayers = !this.activateScene
        //await this.rerender();
    }

    async rerender() {
        await this.render(false);
        this.setPosition();
    }

    async _selectScene(ev) {
        const sceneId = ev.currentTarget.value
        const scene = await game.scenes.get(sceneId);
        await this._loadScene(scene)
    }

    async _importScene(ev) {
        const target = ev.currentTarget.value.split('-')
        const categoryId = target[0]
        const packName = this.sceneCategories[categoryId].packname
        const folderName = this.sceneCategories[categoryId].folder

        const folder = game.folders.find(f => f.name === folderName && f.type === 'Scene')?.id;
        const extra = folder ? {folder} : null
        if (folderName && !folder) {
            ui.notifications.warn(`Your world does not have any Scene folders named '${folderName}'`);
        }

        const sceneId = target[1]
        game.scenes.importFromCollection(packName, sceneId, extra)
            .then(scene => {
                this._loadScene(scene)
            })
    }

    async _loadScene(scene) {
        if (this.activateScene)
            scene.activate()
        else
            scene.view()
        this.close()
    }


    static getDefaultSettings() {
        return {
            activateDefault: true,
            updatePlaylist: false,
            defaultPlaylist: '',
            filterExisting: false,
            categories: []
        }
    }

}
