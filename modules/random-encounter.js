import {moduleName} from "../dsa5-meistertools.js";

export async function randomEncounter() {

    await setLocations()

    new Dialog({
        title: game.i18n.localize(`${moduleName}.randomEncounter`),
        content: `<pre>nix</pre>`,
        buttons: {
            yes: {
                icon: '<i class="fas fa-check"></i>',
                label: "...okay"
            }
        }
    }).render(true).close();
}

export async function setLocations() {

    let re = /^(region|area):(\w+)/;

    let drawings = []
    for (let drawing of game.scenes.active.data.drawings) {

        const match = re.exec(drawing.text);
        if (match === null) {
            drawings.push(drawing)
            continue
        }
        let newFlag = {
            oldtext: drawing.text
        }
        newFlag[match[1]] = match[2]
        let flags = drawing.flags || {}
        flags[moduleName] = {...flags[moduleName], ...newFlag}

        let newStyle = {
            "fillType": 1,
            "fillColor": "#00ff00",
            "fillAlpha": 0.3,
            "strokeWidth": 3,
            "strokeColor": "#000096",
            "strokeAlpha": 0.6,
            "text": match[2],
            "flags": flags
        }

        if (match[1] === 'area') {
            newStyle.fillColor = '#ff0000'
            newStyle.strokeColor = '#000000'
            newStyle.strokeWidth = 10
        }

        drawing = mergeObject(drawing, newStyle)
        drawings.push(drawing)
    }

    console.log(drawings)
    game.scenes.active.update({drawings: []})
    for (let drawing of drawings)
        await Drawing.create(drawing)


}
