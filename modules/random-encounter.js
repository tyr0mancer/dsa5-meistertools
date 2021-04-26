import {moduleName} from "../meistertools.js";

export async function randomEncounter() {
    const location = game.settings.get("dsa5-traveller", 'location')
    const ausgabe = getRandomEncounter('nachwache', location)

    new Dialog({
        title: game.i18n.localize(`${moduleName}.randomEncounter`),
        content: `<h2>Zufallsbegegnung</h2><p>${ausgabe.text}</p><hr/><pre>${JSON.stringify(location, null, 2)}</pre>`,
        buttons: {
            yes: {
                icon: '<i class="fas fa-check"></i>',
                label: "...okay"
            }
        }
    }).render(true).close();
}


function getRandomEncounter(type, location) {
    //todo fetch random encounter by API
    const result = ALL_ENCOUNTER[type].filter(e => filterByLocation(e, location))
    if (result)
        return result[Math.floor(Math.random() * result.length)]
    else return {}
}


function filterByLocation(entry, location) {
    if (entry.biome)
        if (!location.biome?.key || !entry.biome.split(',').includes(location.biome.key)) return false
    if (entry.region) {
        for (let regionKey in entry.region) {
            let found = false
            const currentLocation = location.region.find(r => r.key === regionKey).index.map(i => i.key)
            const requestedLocations = entry.region[regionKey].split(',')
            for (let curLec of currentLocation) {
                console.log(curLec, requestedLocations)
                if (requestedLocations.includes(curLec)) {
                    found = true
                    break
                }
            }
            if (!found)
                return false
        }
    }
    return true
}


// temporary
const ALL_ENCOUNTER = {
    nachwache: [
        {
            biome: 'wald',
            text: 'Ein Goblin schlägt sich so durch'
        },
        {
            region: {politik: 'andergast'},
            text: 'Ein Andergaster kommt zu Besuch'
        },
        {
            region: {politik: 'albernia'},
            text: 'Ein albernischer Bauer hat Bauchweh'
        },
        {
            text: 'Kann immer mal passieren'
        }

    ]
}
