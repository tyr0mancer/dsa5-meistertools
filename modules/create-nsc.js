import {moduleName} from "../dsa5-meistertools.js";
import {Util, MyCompendia} from "./Util.js";

import randomNameRuleSets from "../config/random-name-rule-sets.js";
import archetypes from "../config/archetypes.js";

const NPC_IMAGE_FOLDER = `modules/dsa5-meistertools/images/actor_archetypes`
const TOKEN_POSITION = {'OUTSIDE': "outside", 'TOP_LEFT': "top-left", 'BOTTOM_LEFT': "bottom-left"}

export async function createNSC() {
    const app = new CreateNSC()
    app.render(true)
}


class CreateNSC extends Application {

    constructor() {
        super();

        /*
            read settings
        */
        const {nsc: settings} = game.settings.get(moduleName, 'settings')
        this.settings = settings

        /*
            prepare data which we will extract from the various compendia
        */
        // professions and local Storage folder
        this.myCompendia = new MyCompendia()
        this.myCompendia.add({
            packName: this.settings.professionPack,
            folderName: this.settings.folder,
            key: 'professions',
        })
        // npc packages
        this.settings.packs.forEach(pack => this.myCompendia.add({
            packName: pack.packname,
            folderName: pack.folder,
            key: pack.packname,
            collectionName: 'npc'
        }))


        /*
            general options for selection
        */
        let playerSelection = {}
        let nscSelection = {}
        let importedNscSelection = {}

        /*
            current players, per default all are selected
        */
        this.players = Util.activePlayers().map(a => {
            playerSelection[a._id] = true
            return {name: a.name, _id: a._id, img: a.img}
        })

        /*
            initial formData state
        */
        this.observableData = {
            origin: settings.defaultOrigin,
            culture: settings.defaultCulture,
            profession: settings.defaultProfession,
            anzahl: "1",
            gender: 'random',
            tokenPosition: TOKEN_POSITION.OUTSIDE,

            // todo find better namings
            importedNscSelection,
            playerSelection,
            nscSelection,
        }


    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = `NSC Generator`;
        options.id = `${moduleName}.create-nsc`;
        options.template = `modules/${moduleName}/templates/create-nsc.html`;
        options.tabs = [{navSelector: ".tabs", contentSelector: ".content"}]
        options.resizable = true;
        options.top = 50;
        options.left = 100;
        options.width = 520;
        options.height = 1000;
        return options;
    }


    /* collect and provide data for the template */
    async getData() {
        await this.myCompendia.update()
        const npcList = await this.myCompendia.getCollectionIndex('npc')
        const professions = await this.myCompendia.getCollectionIndex('global', 'professions')
        const tokenPositionOptions = Object.keys(TOKEN_POSITION).map(k => {
            return {
                key: TOKEN_POSITION[k],
                name: k,
            }
        })

        return {
            data: this.observableData,
            settings: this.settings,
            professions: professions.index,
            importedNsc: professions.existing,
            npcList,

            tokenPositionOptions,
            archetypes: getRuleset().archetypes,
            players: this.players
        }
    }

    _handleTextChange(event, html) {
        this._updateDate(event.target.name, event.target.value)
    }

    _handleCheckboxChange(event, html) {
        this._updateDate(event.target.name, "TOGGLE_CHECKBOX")
    }

    _updateDate(varName, varValue) {
        this.observableData = Util.updateByPath(this.observableData, varName, varValue)
        this.render()
    }


    async _saveSettings() {
        const settings = game.settings.get(moduleName, 'settings')
        console.clear()
        this.settings.defaultProfession = this.observableData.profession
        game.settings.set(moduleName, 'settings', mergeObject(settings, {nsc: this.settings}))
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find("input[type='checkbox']").change(event => this._handleCheckboxChange(event, html));
        html.find("input[type='text']").change(event => this._handleTextChange(event, html));
        html.find("input[type='radio']").change(event => this._handleTextChange(event, html));
        html.find("select").change(event => this._handleTextChange(event, html));

        html.find("button[name='store-pattern']").click(event => this._storePattern(event, html));
        html.find("button[name='delete-pattern']").click(event => this._deletePattern(event, html));
        html.find("button[name='load-pattern']").click(event => this._loadPattern(event, html));
        html.find("button[name='generate-nsc']").click(event => this._generateNSC(event, html));
        html.find("button[name='generate-name']").click(event => this._generateName(event, html));

        html.find("button[name='import-selected-players']").click(event => this._importSelectedPlayers(event, html));
        html.find("button[name='import-selected-npc']").click(event => this._importSelectedNpc(event, html));
    }

    /**
     * Stored Patterns
     */
    _storePattern(event, html) {
        this.settings.storedPatterns.push({
            name: this.observableData.patternName,
            config: {
                "profession": this.observableData.profession,
                "origin": this.observableData.origin,
                "culture": this.observableData.culture,
                "anzahl": this.observableData.anzahl,
                "gender": this.observableData.gender
            }
        })
        this._saveSettings().then(() => this.render())
    }

    _deletePattern(event, html) {
        this.settings.storedPatterns.splice(parseInt($(event.currentTarget).attr("data-pattern")), 1)
        this._saveSettings().then(() => this.render())
    }

    _loadPattern(event, html) {
        const pattern = this.settings.storedPatterns[parseInt($(event.currentTarget).attr("data-pattern"))]
        this.observableData = {
            ...this.observableData,
            origin: pattern.config.origin,
            culture: pattern.config.culture,
            anzahl: pattern.config.anzahl,
            gender: pattern.config.gender,
            profession: pattern.config.profession
        }
        this.render()
    }


    /**
     * callbakc function for _generateName
     * @param match
     * @param ruleset
     * @param allTables
     * @return draw a random name
     * @private
     */
    async _drawFromMatch(match, ruleset, allTables) {
        try {
            const result = await allTables
                .find(t => t.data.name === ruleset.tables[match[1]])
                .draw({displayChat: false})
            return result.results[0].text
        } catch (e) {
            ui.notifications.error(`Could not find table '${match[1]}' - ${ruleset.tables[match[1]]}`);
            return ""
        }

    }


    /**
     * generate random name based on culture / origin  combo
     * @param event
     * @param html
     * @return {Promise<void>}
     * @private
     */
    async _generateName(event, html) {
        let nameKey = null
        let genderChanceM = 0.5
        for (let species of getRuleset().archetypes) {
            let origin = species.origins.find(o => o.key === this.observableData.origin)
            if (origin) {
                nameKey = origin.key
                if (origin.cultures) nameKey = origin.cultures.find(c => c.key === this.observableData.culture).key
                if (origin.gender) genderChanceM = origin.gender['m'] / 100
                break
            }
        }
        const ruleset = getRuleset().randomNameRuleSets[nameKey]
        if (ruleset === undefined) {
            ui.notifications.error(`Keine Regeln zur Generierung von Namen "${nameKey}" definiert. Prüfe '/config/random-name-rule-sets.js'`);
            return
        }
        let gender = this.observableData.gender
        // roll gender set to random
        if (gender === 'random')
            gender = await (Math.random() < genderChanceM) ? 'm' : 'w'
        const allTables = await game.packs.get(moduleName + ".names").getContent()
        let result;
        let name = ruleset.rules ? ruleset.rules[gender] : `_vorname${gender} _nachname`
        let tmpName = name
        const regex = /_([a-z]+)/g  // finds all names of tables
        while ((result = regex.exec(tmpName)) !== null) {
            const resultText = await this._drawFromMatch(result, ruleset, allTables)
            name = name.replace(/(_[a-z]+)/, resultText.trim())     // trims and also removes the '_' char in front of the found match, hence another regex
        }
        this.observableData.nsc_name = name
        this.render()
    }


    /**
     * calculates the next position for a token and increases this.lastTokenIndex
     * @param positionType
     * @return {{x: number, y: number}}
     * @private
     */
    _getTokenPosition(positionType = TOKEN_POSITION.OUTSIDE) {
        let tokenSize = parseInt(canvas.scene.data.grid)
        let paddingTop = canvas.scene.data.padding * canvas.scene.data.height
        let paddingLeft = canvas.scene.data.padding * canvas.scene.data.width
        let posTop = (Math.ceil(paddingTop / parseInt(canvas.scene.data.grid))) * tokenSize
        let posLeft = (Math.ceil(paddingLeft / parseInt(canvas.scene.data.grid))) * tokenSize
        let posBottom = (Math.floor((paddingTop + canvas.scene.data.height) / parseInt(canvas.scene.data.grid))) * tokenSize
        let tokenPerRow = Math.floor(canvas.scene.data.width / tokenSize)
        let index = this.lastTokenIndex++
        if (!index) {
            index = 0
            this.lastTokenIndex = 1
        }
        switch (positionType) {
            case TOKEN_POSITION.TOP_LEFT:
                return {
                    x: posLeft + (index % tokenPerRow) * tokenSize,
                    y: posTop + Math.floor(index / tokenPerRow) * tokenSize
                }
            case TOKEN_POSITION.BOTTOM_LEFT:
                return {
                    x: posLeft + (index % tokenPerRow) * tokenSize,
                    y: posBottom
                }
            default:
                return {
                    x: (index % tokenPerRow) * tokenSize,
                    y: Math.floor(index / tokenPerRow) * tokenSize
                }
        }
    }

    /* todo
        berücksichtig keine vom Actor-Avatar abweichende Token-Icon
        berücksichtig Größe des Actors nicht
     */
    moveActorTokenInScene(actor, positionType) {
        console.log(positionType)
        const tokenPosition = this._getTokenPosition(positionType)
        let newToken = {
            name: actor.name,
            x: tokenPosition.x,
            y: tokenPosition.y,
            img: actor.img,
            width: 1,
            height: 1,
            vision: false,
            hidden: false,
            actorId: actor.id,
            actorLink: true,
            actorData: {}
        }
        return canvas.scene.createEmbeddedEntity("Token", newToken)
    }

    async _getImagesByConfig(origin, gender, profession) {
        const FP = new FilePicker({type: "image"})
        this.npcImageChoices = await FP.browse(`${NPC_IMAGE_FOLDER}/${origin}/${gender}/${profession}`)
        console.log(this.npcImageChoices)
    }

    async _generateImage(event, html) {
        if (this.npcImageChoices === [])
            _getImagesByConfig()
    }


    async _generateNSC(event, html) {
        if (!this.observableData.nsc_name || this.observableData.nsc_name === "")
            await this._generateName(event, html)

        /* import actor and find token */
        try {

            const professions = await this.myCompendia.getCollectionIndex('global', 'professions')
            console.log(this.observableData)
            console.log(professions)

            // Pick Image from deepest reachable folder /origin/gender/profession
            // todo check FilePicker implementation on how to do this without rendering
            const FP = new FilePicker({type: "image"})


            const images = await FP.browse(`${NPC_IMAGE_FOLDER}/${this.observableData.origin}/${this.observableData.nsc_gender}/${'actor.name'}`)
            //const images = await FP.browse(`${NPC_IMAGE_FOLDER}/${this.observableData.origin}/${this.observableData.nsc_gender}/${'actor.name'}`)

            //const thingy = `${this.observableData.anzahl}`
            const thingy = '' + this.observableData.anzahl.toString()
            console.log(thingy)
            const amount = Util.rollDice(this.observableData.anzahl.toString())
            for (let i = 0; i < amount; i++) {

                const {extra, type} = await Util.prepareImport(this.settings.professionPack, this.settings.folder)
                let actor = await game[type].importFromCollection(this.settings.professionPack, this.observableData.profession, extra)
                let img = images.files[Math.floor(Math.random() * images.files.length)];
                let name = this.observableData.nsc_name
                let token = duplicate(actor.data.token);
                token['name'] = name
                token['img'] = img
                await actor.update({name, img, token});

                if (this.observableData.tokenPosition && this.observableData.tokenPosition !== "")
                    await this.moveActorTokenInScene(actor, this.observableData.tokenPosition)

                await this._generateName()
            }

            // and reset the generated names and img
            this.observableData.nsc_name = ""
            this.observableData.nsc_img = null
        } catch (e) {
            console.log(e)
            return ui.notifications.error(`Cant create Actor`);
        }

    }


    /**
     * Add Tokens to scene
     */
    _importSelectedPlayers(event, html) {
        console.clear()
        console.log('_importSelectedPlayers')
        console.log(JSON.stringify(this.observableData))
    }

    async _importSelectedNpc(event, html) {

        let npcArray = []
        for (let key of Object.keys(this.observableData.nscSelection)) {
            if (this.observableData.nscSelection[key])
                npcArray.push(key)
        }

        console.clear()
        console.log(npcArray)
        console.log(this.npcPackList)
        for (let npcPack of this.npcPackList) {
            for (let _id of npcArray) {
                const result = npcPack.index.find(e => e._id === _id)
                if (result) {
                    console.log(result)

                    //
                    const {extra, type} = await Util.prepareImport(npcPack.packName, this.settings.folder)
                }
            }
        }


        // add token from already imported actors to the scene
        const folder = game.folders.entities.find(f => f.name === this.settings.folder)?.entities
        for (let key of Object.keys(this.observableData.importedNscSelection)) {
            if (!this.observableData.importedNscSelection[key])
                continue
            const actor = await folder.find(e => e._id === key)
            if (actor)
                await this.moveActorTokenInScene(actor, this.observableData.tokenPosition)
        }

        this.observableData.nscSelection = {}
        this.observableData.importedNscSelection = {}
        this.render()
    }
}

export function getRuleset() {
    return {
        randomNameRuleSets,
        archetypes,
    }
}

