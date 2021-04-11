import {moduleName} from "../dsa5-meistertools.js";

export function randomEncounter() {

    new Dialog({
        title: game.i18n.localize(`${moduleName}.randomEncounter`),
        content: `<p>${game.i18n.localize(`${moduleName}.randomEncounterFeatures`)}</p>`,
        buttons: {
            yes: {
                icon: '<i class="fas fa-check"></i>',
                label: "...okay"
            }
        }
    }).render(true);

}
