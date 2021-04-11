import {moduleName} from "../dsa5-meistertools.js";

export function playerWhisper() {

    new Dialog({
        title: game.i18n.localize(`${moduleName}.playerWhisper`),
        content: `<p>${game.i18n.localize(`${moduleName}.playerWhisperFeatures`)}</p>`,
        buttons: {
            yes: {
                icon: '<i class="fas fa-check"></i>',
                label: "...okay"
            }
        }
    }).render(true);

}
