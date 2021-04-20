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


