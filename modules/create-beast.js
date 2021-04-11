import {moduleName} from "../dsa5-meistertools.js";

export function createBeast() {

    new Dialog({
        title: game.i18n.localize(`${moduleName}.createBiest`),
        content: `<p>${game.i18n.localize(`${moduleName}.createBiestFeatures`)}</p>`,
        buttons: {
            yes: {
                icon: '<i class="fas fa-check"></i>',
                label: "...okay"
            }
        }
    }).render(true);

}
