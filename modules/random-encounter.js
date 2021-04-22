import {moduleName} from "../dsa5-meistertools.js";

export async function randomEncounter() {

    const location = game.settings.get("dsa5-traveller", 'location')
    new Dialog({
        title: game.i18n.localize(`${moduleName}.randomEncounter`),
        content: `<h2>Aktuelle Region</h2><pre>${JSON.stringify(location, null, 2)}</pre>`,
        buttons: {
            yes: {
                icon: '<i class="fas fa-check"></i>',
                label: "...okay"
            }
        }
    }).render(true).close();
}
