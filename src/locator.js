import {moduleName, Meistertools} from "../meistertools.js";
import SceneParser from "./scene-parser.js";
import {MeisterApplication} from "../util/meister-application.js";

export class MeistertoolsLocator extends MeisterApplication {

    static get meisterModule() {
        return {name: "Aktuellen Ort festlegen", icon: "fas fa-map-signs", key: "locator", class: MeistertoolsLocator}
    }

    constructor(moduleKey = MeistertoolsLocator.meisterModule.key) {
        super(moduleKey);
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
            width: 345,
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
        html.find("select[name=biome]").change(async event => {
            await this._updateSettings({"currentLocation.currentBiome": this.settings.biomes.find(b => b.key === event.currentTarget.value)})
            Hooks.call(moduleName + ".update-location", this.settings.currentLocation)
        })
        html.find(".pick-region").click(() => new LocationPicker(async (regions, biomes) => {
            await this._updateSettings({
                "currentLocation.currentRegions": regions,
                "currentLocation.currentBiome": biomes[0]
            })
            Hooks.call(moduleName + ".update-location", this.settings.currentLocation)
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

    static set currentLocation(currentLocation) {
        const locations = game.settings.get(moduleName, 'locations')
        mergeObject(locations, {currentLocation})
        game.settings.set(moduleName, 'locations', locations)
        Hooks.call(moduleName + ".update-location", locations.currentLocation)
    }

    static get currentLocationExpanded() {
        const {currentLocation} = game.settings.get(moduleName, 'locations')
        return {
            currentRegions: this.expandRegions(currentLocation.currentRegions),
            currentBiome: currentLocation.currentBiome,
        }
    }

    static get currentLocatorToken() {
        return game.settings.get(moduleName, 'locations').currentLocation.locatorToken
    }

    static get regions() {
        return game.settings.get(moduleName, 'locations').regions
    }

    static get biomes() {
        return game.settings.get(moduleName, 'locations').biomes
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
     * @param token
     * @return {Error|{currentBiome: {}, currentRegions: []}}
     */
    static updateLocation(token) {
        const settings = game.settings.get(moduleName, 'locations')
        const scene = game.scenes.get(settings.currentLocation.locatorScene)
        if (!scene) return new Error('cant find scene')
        if (!token)
            token = scene?.data?.tokens?.find(t => t._id === settings.currentLocation.locatorToken)
        if (!token) return new Error('cant find token')
        const currentRegions = []
        let biomeKey
        for (const {region, drawingData: drawing} of scene.data.flags[moduleName]?.regions || []) {
            let points = [];
            for (let i = 0; i < drawing.points.length; i++) {
                points.push(drawing.points[i][0] + drawing.x);
                points.push(drawing.points[i][1] + drawing.y);
            }
            let polygon = new PIXI.Polygon(points)
            if (region && polygon.contains(token.data.x + (0.5 * scene.data.grid), token.data.y + (0.5 * scene.data.grid))) {
                if (region.biome)
                    biomeKey = region.biome
                currentRegions.push(region)
            }
        }
        const biome = (biomeKey) ? this.biomes.find(b => b.key === biomeKey) : undefined
        if (biome)
            settings.currentLocation.currentBiome = biome
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
        await canvas.pan({x: this.locatorToken.data.x, y: this.locatorToken.data.y})
        canvas.tokens.activate()
    }

    _openSceneParser() {
        new SceneParser().render(true)
    }
}


export class LocationPicker extends Dialog {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 800
        });
    }

    constructor(callback, {selectedRegions, selectedBiomes, regionOptions, biomeOptions} = {
        selectedRegions: MeistertoolsLocator.currentLocation.currentRegions,
        selectedBiomes: [MeistertoolsLocator.currentLocation.currentBiome]
    }, multipleBiomes = false) {
        let content = `<div class="meistertools region-picker">`
        if (!regionOptions) regionOptions = MeistertoolsLocator.regions
        if (!biomeOptions) biomeOptions = MeistertoolsLocator.biomes
        regionOptions = regionOptions.sort((a, b) => Meistertools.strcmp(a.name, b.name))
        biomeOptions = biomeOptions.sort((a, b) => Meistertools.strcmp(a.name, b.name))
        const selectedRegionKeys = selectedRegions?.map(r => r.key) || []
        const selectedBiomeKeys = selectedBiomes?.map(r => r.key) || []
        for (let category of MeistertoolsLocator.regionCategories) {
            const entriesInCategory = regionOptions.filter(r => r.category === category.key)
            if (!entriesInCategory?.length) continue
            content += `<div class="box header"><h1>${category.name}</h1><div class="inner box float">`
            for (let region of entriesInCategory)
                content += `<div><input class="region" id="${region.key}" name="${region.key}" ${(selectedRegionKeys.includes(region.key) ? "checked" : "")} type="checkbox"/><label for="${region.key}">${region.name}</label></div>`
            content += `</div></div>`
        }

        content += `<div class="box header"><h1>Landschafts-Typen</h1><div class="inner box float">`
        for (let biome of biomeOptions)
            if (multipleBiomes)
                content += `<div><input class="biome" id="${biome.key}" name="${biome.key}" ${(selectedBiomeKeys.includes(biome.key) ? "checked" : "")} type="checkbox"/><label for="${biome.key}">${biome.name}</label></div>`
            else
                content += `<div><input class="biome" id="${biome.key}" name="singleBiomeKey" value="${biome.key}" ${(selectedBiomeKeys.includes(biome.key) ? "checked" : "")} type="radio"/><label for="${biome.key}">${biome.name}</label></div>`
        content += `</div></div>`
        content += `</div>`

        // regions might have been changed. hence close the Dialog
        Hooks.on(moduleName + ".update-settings", () => {
            this.close()
        });

        super({
            title: "Region ausw??hlen",
            content,
            buttons: {
                apply: {
                    icon: "<i class='fas fa-check'></i>",
                    label: "??bernehmen",
                    callback: (html) => {
                        const selectedBiome = html.find("input[name='singleBiomeKey']:checked").val()
                        const selection = {regions: [], biomes: []}
                        html.find("input.region:checked[type='checkbox']").each((i, e) => selection.regions.push(e.id))
                        html.find("input.biome:checked[type='checkbox']").each((i, e) => selection.biomes.push(e.id))
                        const biomeSelection = multipleBiomes ? biomeOptions.filter(r => selection.biomes.includes(r.key)) : biomeOptions.filter(b => b.key === selectedBiome)
                        callback(
                            regionOptions.filter(r => selection.regions.includes(r.key)),
                            biomeSelection
                        )
                    }
                }
            },
            default: "apply"
        });
    }
}
