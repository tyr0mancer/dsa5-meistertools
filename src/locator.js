import {moduleName} from "../meistertools.js";
import {SceneParser} from "./scene-parser.js";

export class MeistertoolsLocator extends Application {
    constructor() {
        super();
        this.settings = game.settings.get(moduleName, 'locations')
        Hooks.on(moduleName + ".update-location", (currentLocation) => {
            mergeObject(this.settings.currentLocation, currentLocation)
            this.render()
        });

    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            top: 50,
            left: 100,
            width: 320,
            height: 420,
            template: `modules/${moduleName}/templates/locator.hbs`,
            id: 'meistertools.locator',
            title: 'MeisterTools Locator',
            tabs: [{navSelector: ".tabs", contentSelector: ".content", initial: "nsc"}]
        });
    }

    async getData() {
        this.locatorScene = game.scenes.get(this.settings.currentLocation.locatorScene)
        this.locatorToken = this.locatorScene?.data?.tokens?.find(t => t._id === this.settings.currentLocation.locatorToken)
        return {
            ...this.settings,
            expandedRegions: MeistertoolsLocator.expandRegions(this.settings.currentLocation.currentRegions),
            locatorScene: this.locatorScene,
            locatorToken: this.locatorToken
        }
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find("button.locate-token").click(() => this._locateToken())
        html.find("button.open-parser").click(() => this._openSceneParser())
        html.find("button.set-scene").click(() => this._updateSettings({"currentLocation.locatorScene": game.scenes.viewed._id}))
        html.find("button.set-token").click(() => this._updateSettings({
            "currentLocation.locatorScene": game.scenes.viewed._id,
            "currentLocation.locatorToken": canvas.tokens.controlled[0]?.id,
        }))
        html.find("select[name=biome]").change(event => this._updateSettings({"currentLocation.currentBiome": this.settings.biomes.find(b => b.key === event.currentTarget.value)}))
        html.find("button.pick-region").click(() => new RegionPicker((regions) => {
            this._updateSettings({"currentLocation.currentRegions": regions})
        }).render(true))
    }

    async _updateSettings(update, trigger = false) {
        if (!this.settings) this.settings = game.settings.get(moduleName, 'locations')
        if (update)
            await mergeObject(this.settings, update)
        await game.settings.set(moduleName, 'locations', this.settings)
        this.render()
    }


    static get currentLocation() {
        const {currentLocation} = game.settings.get(moduleName, 'locations')
        return {
            currentRegions: currentLocation.currentRegions,
            currentBiome: currentLocation.currentBiome,
        }
    }

    static get currentLocationExpanded() {
        const {currentLocation} = game.settings.get(moduleName, 'locations')
        return {
            currentRegions: this.expandRegions(currentLocation.currentRegions),
            currentBiome: currentLocation.currentBiome,
        }
    }

    static get locatorToken() {
        return game.settings.get(moduleName, 'locations').currentLocation.locatorToken
    }

    static get regions() {
        return game.settings.get(moduleName, 'locations').regions
    }

    static get regionCategories() {
        return game.settings.get(moduleName, 'locations').regionCategories
    }

    static expandRegions(regions = MeistertoolsLocator.regions, regionCategories = MeistertoolsLocator.regionCategories) {
        return regionCategories
            .map(c => {
                return {
                    name: c.name,
                    key: c.key,
                    regions: regions.filter(r => r.category === c.key)
                }
            })
            .filter(c => c.regions.length !== 0)
    }

    /**
     * updates current location based on locator token position in locator scene
     * returns updated current biome and regions
     * @param scene
     * @param token
     * @return {Error|{currentBiome: {}, currentRegions: []}}
     */
    static updateLocation(scene, token) {
        const settings = game.settings.get(moduleName, 'locations')
        if (!scene)
            scene = game.scenes.get(settings.currentLocation.locatorScene)
        if (!scene) return new Error('cant find scene')
        if (!token)
            token = scene?.data?.tokens?.find(t => t._id === settings.currentLocation.locatorToken)
        if (!token) return new Error('cant find token')

        const currentRegions = []
        for (const {region, drawing} of scene.data.flags[moduleName]?.regions || []) {
            let points = [];
            for (let i = 0; i < drawing.points.length; i++) {
                points.push(drawing.points[i][0] + drawing.x);
                points.push(drawing.points[i][1] + drawing.y);
            }
            let polygon = new PIXI.Polygon(points)
            if (region && polygon.contains(token.x + (0.5 * scene.data.grid), token.y + (0.5 * scene.data.grid)))
                currentRegions.push(region)
        }
        game.settings.set(moduleName, "locations", mergeObject(settings, {"currentLocation.currentRegions": currentRegions}))
        const currentLocation = {
            currentRegions: settings.currentLocation.currentRegions,
            currentBiome: settings.currentLocation.currentBiome,
        }
        Hooks.call(moduleName + ".update-location", currentLocation)
        return currentLocation
    }


    async _locateToken() {
        if (!this.locatorScene) return
        await this.locatorScene.view()
        if (!this.locatorToken) return
        await canvas.pan({x: this.locatorToken.x, y: this.locatorToken.y})
        canvas.tokens.activate()
    }

    _openSceneParser() {
        new SceneParser().render(true)
    }
}


export class RegionPicker extends Dialog {

    constructor(callback, regions = MeistertoolsLocator.regions, {currentRegions} = MeistertoolsLocator.updateLocation()) {
        let content = `<div class="meistertools">`

        const regionKeys = currentRegions?.map(r => r.key) || []

        for (let category of MeistertoolsLocator.regionCategories) {
            let reggies = regions.filter(r => r.category === category.key)
            if (!reggies?.length) continue
            content += `<div class="box header"><h1>${category.name}</h1><div class="inner box float">`
            for (let region of reggies)
                content += `<div><input id="${region.key}" name="${region.key}" ${(regionKeys.includes(region.key) ? "checked" : "")} type="checkbox"/><label for="${region.key}">${region.name}</label></div>`
            content += `</div></div>`
        }
        content += `</div>`

        // regions might have been changed. hence close the RegionPicker
        Hooks.on(moduleName + ".update-settings", () => {
            this.close()
        });

        super({
            title: "Region auswählen",
            content,
            buttons: {
                ok: {
                    icon: "<i class='fas fa-check'></i>",
                    label: "übernehmen",
                    callback: (html) => {
                        const selection = []
                        html.find("input:checked[type='checkbox']").each((i, e) => selection.push(e.id))
                        callback(regions.filter(r => selection.includes(r.key)))
                    }
                }
            },
            default: "ok"
        });
    }
}
