import {moduleName} from "../meistertools.js";
import {MeistertoolsUtil} from "../meistertools-util.js";
import defaultSettings from "../config/locations.config.js";

export class SceneParser extends Application {
    constructor() {
        super();
        this.formData = {}
        this.hiddenBoxes = {}

        // another scene is viewed
        Hooks.on("canvasInit", () => {
            this.render()
        });
    }

    async _initRegions() {
        const sceneRegions = game.scenes.viewed.getFlag(moduleName, "regions") || []
        const settings = game.settings.get(moduleName, "locations")
        this.biomes = settings.biomes
        this.regionCategories = settings.regionCategories.map(c => {
            if (this.hiddenBoxes[`.${c.key}.regions`] === undefined)
                this.hiddenBoxes[`.${c.key}.regions`] = true // all hidden by default
            return {
                ...c,
                hidden: this.hiddenBoxes[`.${c.key}.regions`],
                regions: settings.regions
                    .filter(r => r.category === c.key)
                    .map(r => {
                        return {
                            ...r,
                            inScene: sceneRegions.filter(e => e.region?.key === r.key && e.region?.category === c.key)
                        }
                    })
            }
        })
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            top: 50,
            left: 100,
            width: 600,
            height: 800,
            resizable: true,
            template: `modules/${moduleName}/templates/scene-parser.hbs`,
            id: 'meistertools.scene-parser',
            title: 'Regionen verwalten',
            tabs: [{navSelector: ".tabs", contentSelector: ".content", initial: "nsc"}]
        });
    }

    async getData() {
        await this._initRegions()
        return {
            scene: game.scenes.viewed,
            hiddenBoxes: this.hiddenBoxes,
            regionCategories: this.regionCategories,
            /*
                        sceneRegions: game.scenes.viewed.getFlag(moduleName, "regions") || [],
            */
            biomes: this.biomes,
            sceneBiome: game.scenes.viewed.getFlag(moduleName, "biome") || {}
        }
    }

    activateListeners(html) {
        super.activateListeners(html);
        MeistertoolsUtil.addDefaultListeners(html, {
            onChange: e => this._handleInput(e),
            onToggle: e => this._handleToggle(e)
        });

        html.find("button.add-drawing").click(event => this._addDrawing(event))
        html.find("button.show-drawing").click(event => this._showDrawing(event))
        html.find("button.remove-drawing").click(event => this._removeDrawing(event))

        html.find("button.parse-scene").click(() => this._parseScene())
        html.find("button.purge-scene").click(() => this._purgeScene())
        html.find("button.purge-drawings").click(() => canvas.drawings.deleteAll())

        html.find("button.add-region").click(event => this._addRegion(event))
        html.find("button.remove-region").click(event => this._removeRegion(event))

        html.find("select#biome").change(async event => {
            const biomeInScene = this.biomes.find(b => b.key === event.currentTarget.value)
            await game.scenes.viewed.setFlag(moduleName, "biome", biomeInScene)
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
        const newRegions = []
        const drawings = scene.getEmbeddedCollection('Drawing')
            .map(drawing => {
                // drawing is assigned to a region already
                if (drawing.flags[moduleName]?.region) return drawing

                // find a region that fits to the drawings name
                const keys = drawing.text.split('.')
                const region = regions.find(r => (keys.length > 1) ? (r.category === keys[0] && r.key === keys[1]) : (r.key === keys[0]))

                // name does not refer to a known region, so no changes apply
                if (!region) return drawing

                // otherwise adjust style of drawing...
                const style = duplicate(regionCategories.find(c => c.key === region.category).style || {})
                style.locked = true
                style.hidden = true
                if (style.fillColor === 'random')
                    style.fillColor = MeistertoolsUtil.niceColor(regions.map(r => r.key).indexOf(region.key))
                const newDrawing = mergeObject(drawing, {
                    text: region.name,
                    flags: {[moduleName]: {region}},
                    ...style
                })

                // ...and add it with the region to scenes flags
                newRegions.push({region, drawing: newDrawing})
                return {...newDrawing}
            })
        await scene.update({drawings})
        ui.notifications.info(`${newRegions.length} neue Region(en) gefunden`);
        const newFlags = newRegions.concat(scene.getFlag(moduleName, "regions") || [])
        await scene.setFlag(moduleName, "regions", newFlags)
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
    async _removeDrawing(event) {
        const drawingId = $(event.currentTarget).attr("data-drawing-id")
        const drawings = game.scenes.viewed.getEmbeddedCollection('Drawing').filter(d => d._id !== drawingId)
        await game.scenes.viewed.update({drawings})
        const flags = game.scenes.viewed.getFlag(moduleName, "regions") || []
        await game.scenes.viewed.setFlag(moduleName, "regions", flags.filter(f => f.drawing?._id !== drawingId))
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
        console.log(canvas.drawings)
        console.log(drawingId, visibility)

        // if we hide a region, we just remove the drawing from the map
        if (visibility === 'hidden') {
            //canvas.scene.deleteEmbeddedDocuments("Drawing", [], {deleteAll: true})
            canvas.scene.deleteEmbeddedDocuments("Drawing", [drawingId])

            //const drawingMap = scene.getEmbeddedCollection('Drawing')
            //drawingMap.delete(drawingId)
            //console.log(drawingMap.map(d => [d._id, d]))
/*
            canvas.scene.deleteEmbeddedDocuments
            const result = await scene.update({drawings: []})
            console.log(result)
*/
            return
        }


        const {drawing} = game.scenes.viewed.getFlag(moduleName, "regions").find(e => e.drawing?._id === drawingId)
        console.log(drawing)
        canvas.scene.createEmbeddedDocuments("Drawing", [drawing])
/*
        drawing.hidden = (visibility === 'gm-only')
        canvas.pan({
            x: drawing.x + Math.floor(drawing.width / 2),
            y: drawing.y + Math.floor(drawing.height / 2)
        });
        drawings.push(drawing)
        await game.scenes.viewed.update({drawings})
*/


        /*

                    console.clear()
                    console.log(game.scenes.viewed.getEmbeddedCollection('Drawing'),drawingId)
                    game.scenes.viewed.getEmbeddedCollection('Drawing').delete(drawingId)
                    console.log(game.scenes.viewed.getEmbeddedCollection('Drawing'))
        */
        //await game.scenes.viewed.update({drawings})

        //game.scenes.viewed.getEmbeddedCollection('Drawing').delete(drawingId)
        //const drawings = game.scenes.viewed.getEmbeddedCollection('Drawing').filter(d => d._id !== drawingId) //.map(e=>e)
        /*
                    console.log(drawings, drawingId)
                    const res =  await game.scenes.viewed.update({drawings: []})
                    console.log(res)
        */

        /*        // adjust visibility for existing drawing and center view
                let drawingExists = false
                const drawings = game.scenes.viewed.getEmbeddedCollection('Drawing').map(drawing => {
                    if (drawing._id === drawingId) {
                        drawing.hidden = (visibility === 'gm-only')
                        drawingExists = true
                        canvas.pan({
                            x: drawing.x + Math.floor(drawing.width / 2),
                            y: drawing.y + Math.floor(drawing.height / 2)
                        });
                    }
                    return {...drawing}
                }) || []*/

        // if drawing doesnt exist yet, we gotta paint it
//        if (!drawingExists) {
//        }

        // perform update of drawings in scene
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
            const key = MeistertoolsUtil.stringToKey(value, ' ', "last")
            if (!target.val()) {
                target.val(key);
                this.formData[category + '-new-region-key'] = key
            }
        }
    }

    _handleToggle(target) {
        this.hiddenBoxes[target] = !(this.hiddenBoxes[target] || false)
    }


    async _addRegion(event) {
        event.preventDefault()
        const category = $(event.currentTarget).attr("data-category")
        const key = this.formData[category + '-new-region-key']
        const name = this.formData[category + '-new-region-name']
        const settings = game.settings.get(moduleName, "locations")
        if (!key || !name || !category) return
        settings.regions.push({category, key, name})
        await game.settings.set(moduleName, "locations", settings)
        this.render()
    }

    async _removeRegion(event) {
        const category = $(event.currentTarget).attr("data-category")
        const key = $(event.currentTarget).attr("data-key")
        const settings = game.settings.get(moduleName, "locations")
        settings.regions = settings.regions.filter(r => r.category !== category || r.key !== key)
        await game.settings.set(moduleName, "locations", settings)
        this.render()
    }

}
