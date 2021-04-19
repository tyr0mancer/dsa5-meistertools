export class Util {

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


}


export class MyCompendia {

    constructor() {
        this.compendia = []
        this.updateAvailable = true
    }


    add({key = null, name = null, folderName = null, packName, collectionName = 'global'}) {

        let {entityType, folder, type, extra, pack} = {}

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
                // todo create folder
                ui.notifications.warn(`Your world does not have any ${entityType} folders named '${folderName}'. Storing in Root Folder for now`);
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


    /*
        imports Entity into folder
     */
    async import(_id, packName) {
        const {extra, entityType} = this.compendia.find(c => c.packName === packName)
        return await game[entityType].importFromCollection(packName, _id, extra)
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


    /*
        Find an enitiy by at least id, ideally also collectionName and key
        todo: can there realistically be collisions? is this unnecessary?
     */
    async getImportedEntity(entityId, collectionName = 'global', key) {
        const pack = await this.getCollectionIndex(collectionName, key)
        if (!pack) return new Error('Pack not found')
        console.log(pack)
        /*
                const entity = await game[pack.entityType].importFromCollection(pack.packName, entityId, pack.folder ? {folder: pack.folder} : null)
                //getCollectionIndex
                getEntities('npc', null, this.observableData.stockNscSelection)
        */

    }

}


