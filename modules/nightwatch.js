import {moduleName} from "../meistertools.js";
import {MeistertoolsUtil, MyCompendia, MyFilePicker} from "../meistertools-util.js";

const PROP_OPTIONS = [{
    name: "Zelt aufbauen",
    height: 400, width: 400,
    img: "modules/dsa5-core/icons/equipment/Zelt1Person.webp",
    //tile: `modules/dsa5-meistertools/images/nightwatch/zelt.png`,
}, {
    name: "Schlafsack ausbreiten",
    height: 200, width: 200,
    img: "modules/dsa5-core/icons/equipment/Schlafsack.webp"
}]

export class Dsa5Nightwatch extends Application {

    constructor() {
        super();
        /*
                game.scenes.active.setFlag(moduleName, 'tiles', [])
                this.tiles = [] //game.scenes.active.getFlag(moduleName, 'tiles') || []
        */
        this.props = game.scenes.active.getFlag(moduleName, 'props') || []
        this.tokens = game.scenes.active.data.tokens
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            title: `Nachtwache`,
            resizable: true,
            top: 80,
            left: 100,
            width: 600,
            height: 800,
            popOut: true,
            classes: ['form'],
            template: `modules/${moduleName}/templates/nachtwache.html`,
            id: `${moduleName}.manage-scenes`,
            tabs: [{navSelector: ".tabs", contentSelector: ".content", initial: "initial-tab"}]
        });
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find("nav.help-icon").click((event) => $('.help-info.help-' + $(event.currentTarget).attr("data-help")).toggle())
        html.find("a[name=make-fire]").click(event => this._makeFire(event))
        html.find("a[name=place-prop]").click(event => this._placeProp(event))
        html.find("button[name=nightwatch]").click(event => this._nightwatch(event))
        html.find("a[name=remove-prop]").click(event => this._removeProp(event))
    }

    async getData() {
        return {
            tokens: this.tokens,
            props: this.props,
            propOptions: PROP_OPTIONS,
            images: {
                fireplace: "modules/dsa5-core/icons/equipment/FeuersteinundStahl.webp"
            },
        };
    }


    async _placeProp(event) {
        const tokenId = $(event.currentTarget).attr("data-token-id")
        const propId = $(event.currentTarget).attr("data-prop-id")
        const token = game.scenes.active.data.tokens.find(t => t._id === tokenId) || {x: 200, y: 200}
        let {img, tile, width, height, name} = PROP_OPTIONS[propId]
        let result = await Tile.create({
            img: tile || img,
            width: width || 100,
            height: height || 100,
            scale: 1,
            x: token.x - 50,
            y: token.y - 50,
            z: 555,
            rotation: 0,
            hidden: false,
            locked: false
        });
        await this._addPropEntry({
            tile: result.data._id, name, img, token: token.name
        })
        this.render()
    }


    async _removeProp(event) {
        const propId = $(event.currentTarget).attr("data-prop-id")
        if (!propId) return
        const prop = this.props[propId]
        if (prop.tile)
            game.scenes.active.deleteEmbeddedEntity("Tile", prop.tile)
        if (prop.light)
            game.scenes.active.deleteEmbeddedEntity("AmbientLight", prop.light)
        if (prop.sound)
            game.scenes.active.deleteEmbeddedEntity("AmbientSound", prop.sound)
        this.props.splice(propId, 1)
        const props = duplicate(this.props)
        await game.scenes.active.setFlag(moduleName, 'props', props)
        this.render()
    }

    async _addPropEntry(entry) {
        this.props.push(entry)
        const props = duplicate(this.props)
        await game.scenes.active.setFlag(moduleName, 'props', props)
    }


    async _placeFire(token) {
        if (!token) return
        let light = await AmbientLight.create({
            "t": "l", "x": token.x, "y": token.y, "hidden": false, "rotation": 0, "dim": 25, "bright": 10,
            "angle": 360, "darknessThreshold": 0, "tintColor": "#FF0000", "tintAlpha": 0.04,
            "lightAnimation": {"type": "torch", "speed": 2, "intensity": 2}
        });
        let tile = await Tile.create({
            img: `modules/${moduleName}/images/nightwatch/feuerstelle.png`,
            width: 100, height: 100, scale: 1, x: token.x - 50, y: token.y - 50, z: 370,
            rotation: 0, hidden: false, locked: false
        });
        let sound = await AmbientSound.create({
            t: "l", x: token.x, y: token.y, radius: 60, easing: true,
            path: `modules/${moduleName}/sounds/feuer.mp3`, repeat: true, volume: 1
        });
        await this._addPropEntry({
            light: light.data._id,
            sound: sound.data._id,
            tile: tile.data._id,
            name: "Feuerstelle",
            token: token.name,
            img: `modules/${moduleName}/images/nightwatch/feuerstelle.png`
        })
    }

    async _makeFire(event) {
        const tokenName = $(event.currentTarget).attr("data-token-name")
        const tokenId = $(event.currentTarget).attr("data-token-id")
        const {success} = await MeistertoolsUtil.requestRoll({
            talent: 'Wildnisleben',
            modifier: 1,
            reason: "Um Feuer zu machen",
            playerName: tokenName
        })
        if (success) {
            const token = game.scenes.active.data.tokens.find(t => t._id === tokenId) || {x: 200, y: 200}
            await this._placeFire(token)
            this.render()
        }
    }


    _nightwatch(event) {
        MeistertoolsUtil.requestRoll({talent: 'Wildnisleben', modifier: 3, reason: "Um wach zu bleiben."})
            .then(({qs, success, critical}) => {
                let modifier = [0, 1, 3, 5][qs] || -3
                let reason = success ? "Du bist aufmerksam geblieben! Aber hast du auch nichts verpasst?" : "Du hast dich ablenken lassen, gleichen deine Sinne das aus?"
                if (critical)
                    this._nightwatchEvent({success: false, critical: true, reason: "sleeping"})
                else
                    MeistertoolsUtil.requestRoll({talent: 'Sinnesschärfe', modifier, reason})
                        .then(result => this._nightwatchEvent(result))
            })
    }

    _nightwatchEvent(param) {
        if (!this.nightwatchResult)
            this.nightwatchResult = []

        /*
                console.clear()
                console.log(JSON.stringify(param))
        */
    }
}
