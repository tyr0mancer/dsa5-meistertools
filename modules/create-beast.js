import {moduleName} from "../dsa5-meistertools.js";

export async function createBeast() {

    const locations = await getLocations()
    new Dialog({
        title: game.i18n.localize(`${moduleName}.createBiest`),
        content: `<pre>${JSON.stringify(locations, null, 2)}</pre>`,
        buttons: {
            yes: {
                icon: '<i class="fas fa-check"></i>',
                label: "...okay"
            }
        }
    }).render(true);
}


export async function getLocations() {
    const token = game.scenes.active.data.tokens[0]
    const gridSize = game.scenes.active.data.grid
    const tokenX = token.x + (0.5 * gridSize)
    const tokenY = token.y + (0.5 * gridSize)
    let locations = {
        area: [],
        region: []
    }
    for (let drawing of game.scenes.active.data.drawings) {
        let points = [];
        for (let i = 0; i < drawing.points.length; i++) {
            points.push(drawing.points[i][0] + drawing.x);
            points.push(drawing.points[i][1] + drawing.y);
        }
        const polygon = new PIXI.Polygon(points)
        console.log(drawing.flags)
        const value = drawing.flags[moduleName]
        if (value && polygon.contains(tokenX, tokenY)) {
            for (let key in value) {
                if (key !== 'oldtext')
                    locations[key].push(value[key])
            }
        }
    }
    return locations
}
