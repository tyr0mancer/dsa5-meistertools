import {moduleName} from "../dsa5-meistertools.js";

export function createNSC() {

    new Dialog({
        title: game.i18n.localize(`${moduleName}.createNSC`),
        content: `<p>${game.i18n.localize(`${moduleName}.createNSCFeatures`)}</p>`,
        buttons: {
            yes: {
                icon: '<i class="fas fa-check"></i>',
                label: "...okay"
            }
        }
    }).render(true);

}
