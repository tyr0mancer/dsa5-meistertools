export class Util {

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
            let extra = folder ? { folder } : null
            if (folderName && !folder) {
                ui.notifications.warn(`Your world does not have any ${type} folders named '${folderName}'`);
                // reject('folder not found')
            }
            resolve({ pack, extra, type, existing })
        });
    }

}

