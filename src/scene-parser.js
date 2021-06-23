import {moduleName, Meistertools} from "../meistertools.js";
import defaultSettings from "../config/locations.config.js";

const MAP_DISTANCE_TOLERANCE = 1 // how close shall maps be to be considered the same map?

export default class SceneParser extends Application {
    isOpen = false

    toggle() {
        if (this.isOpen)
            this.close()
        else
            this.render(true)
    }

    close() {
        this.isOpen = false
        super.close()
    }

    render(force) {
        this.isOpen = true
        super.render(force)
    }

    constructor() {
        super();
        this.formData = {}
        this.hiddenBoxes = {}
        this._expandedTargets = {}

        // another scene is viewed
        Hooks.on("canvasInit", () => {
            this.render()
        });

        Hooks.on("createDrawing", () => {
            this.render()
        });

    }

    async _initRegions() {
        const sceneRegions = game.scenes.viewed.getFlag(moduleName, "regions") || []
        const {regions, regionCategories, biomes} = game.settings.get(moduleName, "locations")
        const sceneDrawings = game.scenes.viewed.getEmbeddedCollection('Drawing')

        this.biomeOptions = duplicate(biomes)
        this.sceneBiome = game.scenes.viewed.getFlag(moduleName, "biome") || {}

        for (let c of regionCategories) {
            if (this.hiddenBoxes[`.${c.key}.regions`] === undefined)
                this.hiddenBoxes[`.${c.key}.regions`] = true // all hidden by default
        }

        this.regionMap = new Map(regionCategories.map(c => [c.key, {
            ...c,
            hidden: this.hiddenBoxes[`.${c.key}.regions`],
            regions: new Map()
        }]))

        for (let region of regions)
            this.regionMap.get(region.category)?.regions.set(region.key, {...region, inScene: false, drawings: []})

        for (let {region, drawingData: drawing} of sceneRegions) {
            const regionEntry = this.regionMap.get(region.category)?.regions.get(region.key)
            if (regionEntry) {
                regionEntry.inScene = true
                regionEntry.drawings.push({...drawing, inScene: false})
            }
        }

        const distance = (a, b) => Math.abs(a - b)
        const closeEnough = ({x: x1, y: y1}, {x: x2, y: y2}) => distance(x1, x2) <= MAP_DISTANCE_TOLERANCE && distance(y1, y2) <= MAP_DISTANCE_TOLERANCE
        for (let drawing of sceneDrawings) {
            const region = drawing.getFlag(moduleName, 'region')
            if (region) {
                const fittingDrawing = this.regionMap.get(region.category)?.regions.get(region.key)?.drawings
                    .find(d => closeEnough(d, drawing.data))
                if (fittingDrawing) {
                    fittingDrawing.inScene = true
                    fittingDrawing._id = drawing._id
                }
            }
        }

    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            top: 50,
            left: 100,
            width: 400,
            height: 800,
            resizable: true,
            template: `modules/${moduleName}/templates/scene-parser.hbs`,
            id: 'meistertools.scene-parser',
            title: 'Kartograf',
            tabs: [{navSelector: ".tabs", contentSelector: ".content", initial: "nsc"}]
        });
    }

    async getData() {
        await this._initRegions()
        return {
            scene: game.scenes.viewed,
            hiddenBoxes: this.hiddenBoxes,
            regionMap: this.regionMap,
            newDrawings: game.scenes.viewed.getEmbeddedCollection('Drawing')?.map(e => e).filter(e => !e.getFlag(moduleName, 'region')).length > 0,
            biomeOptions: this.biomeOptions,
            sceneBiome: this.sceneBiome,
            _expandedTargets: this._expandedTargets
        }
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find(".toggle").click((event) => {
            const target = $(event.currentTarget).attr("data-target")
            this._expandedTargets[target.replace(".", "")] = $(event.currentTarget).hasClass('show')
            $(event.currentTarget).toggleClass('show')
            $(target).toggle()
        })

        Meistertools.addDefaultListeners(html, {
            onChange: e => this._handleInput(e),
            onToggle: e => this._handleToggle(e)
        });

        html.find(".add-drawing").click(event => this._addDrawing(event))
        html.find(".show-drawing").click(event => this._showDrawing(event))
        html.find(".remove-map-entry").click(event => this._removeMapEntry(event))

        html.find("button.parse-scene").click(() => this._parseScene())
        html.find("button.remove-new-drawings").click(() => this._removeNewDrawings())

        html.find("button.purge-scene").click(() => this._purgeScene())
        html.find("button.purge-drawings").click(() => canvas.drawings.deleteAll())

        html.find("select[name=biome]").change(async (event) => {
            const biome = this.biomeOptions.find(b => b.key === event.currentTarget.value)
            if (biome)
                await game.scenes.viewed.setFlag(moduleName, "biome", biome)
            else
                await game.scenes.viewed.unsetFlag(moduleName, "biome")
            this.render()
        })

    }

    /**
     * initial default values for regions and biomes
     */
    static get defaultSettings() {
        return defaultSettings
    }


    /**
     * parses drawings from a scene (by default its the currently viewed scene)
     * if the name of the drawing matches a region key the drawing will be interpreted as territory accordingly
     * the geo locations and region keys are stored in the scenes flags
     * @param scene
     */
    async _parseScene(scene = game.scenes.viewed) {
        const {regions, regionCategories} = game.settings.get(moduleName, "locations")
        const sceneRegions = scene.getFlag(moduleName, "regions") || []
        for (const drawing of scene.getEmbeddedCollection('Drawing')) {
            // drawing is assigned to a region already
            if (drawing.getFlag(moduleName, "region"))
                continue;

            // find a region that fits to the drawings name
            /*
                        const keys = drawing.data.text.split('.')
                        const region = regions.find(r => (keys.length > 1) ? (r.category === keys[0] && r.key === keys[1]) : (r.key === keys[0]))
            */
            const regionKey = drawing.data.text.split('.').pop()
            const region = regions.find(r => r.key === regionKey)

            // name does not refer to a known region
            if (!region) continue;

            const style = duplicate(regionCategories.find(c => c.key === region.category).style || {})
            style.locked = true
            style.hidden = true
            if (!style.text) style.text = region.name
            if (style.fillColor === 'random')
                style.fillColor = Meistertools.niceColor(regions.map(r => r.key).indexOf(region.key))
            await drawing.update({...style})
            await drawing.setFlag(moduleName, "region", region)
            sceneRegions.push({region, drawingData: {...drawing.data}})
            ui.notifications.info(`Neue Zeichnung gefunden: ${region.name}`);

        }
        await scene.setFlag(moduleName, "regions", sceneRegions)
        this.render()
    }


    /**
     * parses drawings from a scene (by default its the currently viewed scene)
     * if the name of the drawing matches a region key the drawing will be interpreted as territory accordingly
     * the geo locations and region keys are stored in the scenes flags
     * @param scene
     */
    async _purgeScene(scene = game.scenes.viewed) {
        await scene.unsetFlag(moduleName, "regions")
        this.render()
    }

    /**
     * set default text according to selected region and gets into draw freestyle mode
     * @private
     */
    _addDrawing(event) {
        const label = $(event.currentTarget).attr("data-label")
        const drawingSettings = game.settings.get("core", DrawingsLayer.DEFAULT_CONFIG_SETTING);
        mergeObject(drawingSettings, {
            text: label,
            bezierFactor: 0.5,
            fillAlpha: 0.5,
            fillColor: "#9C9FB8",
            fillType: 1,
            fontFamily: "Signika",
            fontSize: 48,
            strokeAlpha: 1,
            strokeColor: "#340C01",
            strokeWidth: 4,
            textAlpha: 1,
            textColor: "#FFFFFF",
            texture: "",
        })
        game.settings.set("core", DrawingsLayer.DEFAULT_CONFIG_SETTING, drawingSettings);

        // todo doesnt seem to change activeTool to freehand
        ui.controls.controls.activeTool = 'freehand'
        canvas.drawings.activate()
        ui.controls.render()
    }

    /**
     * removes drawing from canvas and according entry from scene flag
     * @param event
     * @return {Promise<void>}
     * @private
     */
    async _removeMapEntry(event) {
        const drawingId = $(event.currentTarget).attr("data-drawing-id")
        const drawingCanvas = game.scenes.viewed.getEmbeddedCollection('Drawing')?.get(drawingId)
        const sceneRegions = game.scenes.viewed.getFlag(moduleName, "regions") || []
        let drawingFlag = sceneRegions.find(r => r.drawingData._id === drawingId) || {}
        if (!drawingFlag.drawingData) {
            const regionPerDrawing = drawingCanvas?.getFlag(moduleName, "region")
            drawingFlag = sceneRegions.find(r => r.region.key === regionPerDrawing.key && r.drawingData.x === drawingCanvas.data.x) || {}
        }
        if (drawingFlag.drawingData?._id)
            await game.scenes.viewed.setFlag(moduleName, "regions", sceneRegions.filter(r => r.drawingData._id !== drawingFlag.drawingData._id))
        if (drawingCanvas)
            await game.scenes.viewed.deleteEmbeddedDocuments("Drawing", [drawingCanvas._id])
        this.render()
    }


    /**
     * adjusts visibility of a drawing of a region entry
     * @param event
     * @private
     */
    async _showDrawing(event) {
        const drawingId = $(event.currentTarget).attr("data-drawing-id")
        const visibility = $(event.currentTarget).attr("data-visibility")
        if (visibility === 'hidden') {
            await game.scenes.viewed.deleteEmbeddedDocuments("Drawing", [drawingId])
            this.render()
        } else {
            const sceneRegions = game.scenes.viewed.getFlag(moduleName, "regions")
            const {drawingData: drawing} = sceneRegions.find(r => r.drawingData._id === drawingId)
            await game.scenes.viewed.createEmbeddedDocuments("Drawing", [drawing])
            canvas.pan(drawing)
            this.render()
        }
    }


    /**
     * handles changes in input fields for new regions. needs refactoring
     * @param event
     * @private
     */
    _handleInput(event) {
        const {name, value} = event.currentTarget
        this.formData[name] = value
        if (name.endsWith("-name")) {
            const category = name.split('-')[0]
            const target = $('input[name=' + category + '-new-region-key]')
            const key = Meistertools.stringToKey(value, ' ', "last")
            if (!target.val()) {
                target.val(key);
                this.formData[category + '-new-region-key'] = key
            }
        }
    }

    _handleToggle(target) {
        this.hiddenBoxes[target] = !(this.hiddenBoxes[target] || false)
    }

    _removeNewDrawings() {
        for (const drawing of game.scenes.viewed.getEmbeddedCollection('Drawing')) {
            if (!drawing.getFlag(moduleName, "region"))
                drawing.delete()
        }
        this.render()
    }

}
