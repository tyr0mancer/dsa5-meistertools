export class MeistertoolsUtil {

    static rollDice(pattern) {
        let r = new Roll(pattern);
        r.evaluate()
        return parseInt(r.total)
    }

    static activePlayers() {
        const activeUserIds = game.users
            .filter(u => u.active && u.role !== 4)
            .map(u => u._id)

        return game.actors
            .filter(u => {
                for (let userId of activeUserIds) {
                    if (u.data.permission[userId] === 3)
                        return true
                }
                return false
            })
    }

    static updateByPath(obj, varName, varValue) {
        let path = varName.split(".");
        let fieldName = path.splice(path.length - 1, 1);
        let objField = path.reduce((r, u) => r && r[u] ? r[u] : '', obj);
        if (varValue === 'TOGGLE_CHECKBOX')
            objField[fieldName] = (objField[fieldName] === undefined || objField[fieldName] === false);
        else
            objField[fieldName] = varValue;
        return obj
    }

    static getRandomId(length = 16) {
        let result = [];
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result.push(characters.charAt(Math.floor(Math.random() *
                charactersLength)));
        }
        return result.join('');
    }

}


export class MyFilePicker extends FilePicker {
    constructor(options) {
        super(options);
    }

    /* -------------------------------------------- */

    /**
     * Browse to a specific location for this FilePicker instance
     * @param {string} [target]   The target within the currently active source location.
     * @param {Object} [options]  Browsing options
     */
    async browse(target, options = {}) {

        // If the user does not have permission to browse, do not proceed
        if (game.world && !game.user.can("FILES_BROWSE")) return;

        // Configure browsing parameters
        target = typeof target === "string" ? target : this.target;
        const source = this.activeSource;
        options = mergeObject({
            extensions: this.extensions,
            wildcard: false
        }, options);

        // Determine the S3 buckets which may be used
        if (source === "s3") {
            if (this.constructor.S3_BUCKETS === null) {
                const buckets = await this.constructor.browse("s3", "");
                this.constructor.S3_BUCKETS = buckets.dirs;
            }
            this.sources.s3.buckets = this.constructor.S3_BUCKETS;
            if (!this.source.bucket) this.source.bucket = this.constructor.S3_BUCKETS[0];
            options.bucket = this.source.bucket;
        }

        // Avoid browsing certain paths
        if (target.startsWith("/")) target = target.slice(1);
        if (target === CONST.DEFAULT_TOKEN) target = this.constructor.LAST_BROWSED_DIRECTORY;

        // Request files from the server
        const result = await this.constructor.browse(source, target, options).catch(error => {
            ui.notifications.warn(error);
            return this.constructor.browse(source, "", options);
        });

        // Populate browser content
        this.result = result;
        this.source.target = result.target;
        if (source === "s3") this.source.bucket = result.bucket;
        this.constructor.LAST_BROWSED_DIRECTORY = result.target;
        this._loaded = true;

        // Render the application
        return result;
    }


}


export class MyCompendia {

    constructor() {
        this.compendia = []
        this.updateAvailable = true
    }


    async add({key = null, name = null, folderName = null, packName, collectionName = 'global'}) {

        let {entityType, folder, pack} = {}

        // set the pack if its not local only packages
        if (packName) {
            pack = game.packs.get(packName)
            if (pack === null) {
                ui.notifications.error(`Could not find pack '${packName}'`);
                return Error(`pack not found: ${packName}`)
            }

            // set entity type
            entityType = pack.metadata.entity.toLowerCase();
            entityType = (entityType === 'journalentry') ? 'journal' : entityType + 's';

            // set folder and prepare in case we want to import from pack
            folder = game.folders.find(f => f.name === folderName && f.type === pack.entity)?.id;
            if (folderName && !folder) {
                ui.notifications.info(`Your world did not have a ${entityType} folder named '${folderName}'. DSA5 Meistertools created this folder automatically.`);
                await Folder.create({
                    "name": folderName,
                    "type": "Actor",
                    "sort": 300000,
                    "parent": null,
                    "sorting": "m",
                    "color": "#373d6d"
                });
                folder = game.folders.find(f => f.name === folderName && f.type === pack.entity)?.id;
            }
        }

        if (!key)
            key = packName

        if (!name && pack)
            name = pack.metadata.label
        this.compendia.push({
            pack,
            name,
            folder,
            collectionName,
            key,
            packName,
            folderName,
            entityType,
            existing: [],
            index: [],
        })
    }


    /*
        Main purpose is providing data for the getData() Method in Application instances
     */
    getCollectionIndex(collectionName = 'global', key = null) {
        const filteredArray = this.compendia
            .filter(c => c.collectionName === collectionName)
        return (!key) ? filteredArray : filteredArray.find(c => c.key === key)
    }


    async _updateExisting() {
        let updatedCompendia = []
        for (let compendium of this.compendia) {
            if (compendium.folder) {
                const folder = await game.folders.get(compendium.folder)
                compendium.existing = folder.entities.map(
                    e => {
                        return {
                            name: e.data.name,
                            img: e.data.img,
                            _id: e.data._id,
                        }
                    })
            }
            updatedCompendia.push(compendium)
        }

        this.compendia = updatedCompendia
    }

    async _updateIndex() {
        let updatedCompendia = []
        for (let compendium of this.compendia) {
            if (compendium.pack) {
                await compendium.pack.getIndex()
                compendium.index = compendium.pack.index
            }
            updatedCompendia.push(compendium)
        }
        this.compendia = updatedCompendia
    }

    async update(force = false) {
        if (!this.updateAvailable && !force) return
        console.log('dsa5-meistertools |', 'reading index and existing entities of a pack')
        await this._updateExisting()
        await this._updateIndex()
        this.updateAvailable = false
    }


    async getEntities(entityList = {}, collectionName = 'global', key) {
        let returnFirst = false
        if (typeof entityList === 'string') {
            let tmp = {}
            tmp[entityList] = true
            entityList = tmp
            returnFirst = true
        }
        let packList = await this.getCollectionIndex(collectionName, key)
        if (!Array.isArray(packList))
            packList = [packList]
        let result = []
        for (let entityId of Object.keys(entityList)) {
            if (!entityList[entityId]) continue
            for (let pack of packList) {
                let entity = pack.existing.find(e => e._id === entityId)
                if (entity)
                    entity = await game.folders.get(pack.folder).entities.find(e => e.data._id === entityId)
                else
                    entity = await game[pack.entityType].importFromCollection(pack.packName, entityId, pack.folder ? {folder: pack.folder} : null)
                if (entity) {
                    if (returnFirst)
                        return entity
                    else
                        result.push(entity)
                }
            }
        }
        return result
    }

}


