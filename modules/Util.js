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


    static async prepareImport(packName, folderName) {
        return new Promise((resolve, reject) => {
            let pack = game.packs.get(packName);
            const existing = game.folders.entities.find(f => f.name === folderName);

            if (pack === null) {
                ui.notifications.error(`Could not find pack '${packName}'`);
                reject('pack not found')
            }
            let folder = game.folders.find(f => f.name === folderName && f.type === pack.entity)?.id;
            let type = pack.metadata.entity.toLowerCase();
            type = type === 'journalentry' ? 'journal' : type + 's';
            let extra = folder ? {folder} : null
            if (folderName && !folder) {
                ui.notifications.warn(`Your world does not have any ${type} folders named '${folderName}'`);
                // reject('folder not found')
            }
            resolve({pack, extra, type, existing})
        });
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
            //console.log(pack)

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
        //console.log('looking for', collectionName)
        //console.log(this.compendia)
        const filteredArray = this.compendia
            .filter(c => c.collectionName === collectionName)
        return (!key) ? filteredArray : filteredArray.find(c => c.key === key)
    }


    async import(_id, packName) {
        const {extra, entityType} = this.compendia.find(c => c.packName === packName)
        return await game[entityType].importFromCollection(packName, _id, extra)
    }


    async _updateExisting() {
        let updatedCompendia = []
        for (let compendium of this.compendia) {
            /*
                        await compendium.pack?.getIndex()
                        compendium.index = compendium.pack.index
                        console.log(compendium)
            */
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
}


