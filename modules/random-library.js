import {moduleName} from "../meistertools.js";

export function randomLibrary() {

    new Dialog({
        title: game.i18n.localize(`${moduleName}.randomLibrary`),
        content: `<p>${game.i18n.localize(`${moduleName}.randomLibraryFeatures`)}</p>`,
        buttons: {
            yes: {
                icon: '<i class="fas fa-check"></i>',
                label: "...okay"
            }
        }
    }).render(true);

}
