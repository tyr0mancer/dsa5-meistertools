import {moduleName} from "../meistertools.js";
import {MeistertoolsUtil, MyCompendia, MyFilePicker} from "../meistertools-util.js";

import randomNameRuleSets from "../config/random-name-rule-sets.js";
import archetypes from "../config/archetypes.js";

const TOKEN_POSITION = {'OUTSIDE': "outside", 'TOP_LEFT': "top-left", 'BOTTOM_LEFT': "bottom-left", 'CENTER': "center"}

export async function createNSC() {
    const app = new CreateNSC()
    app.render(true)
}


export class CreateNSC extends Application {

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
        if (this.settings.packs)
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
        let packNscSelection = {}
        let stockNscSelection = {}

        /*
            current players, per default all are selected
        */
        MeistertoolsUtil.activePlayers().map(a => playerSelection[a._id] = true)
        this.players = game.actors.map(a => {
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
            tokenPosition: TOKEN_POSITION.TOP_LEFT,
            playerTokenPosition: TOKEN_POSITION.CENTER,
            stockNscSelection,
            playerSelection,
            packNscSelection,
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
        const packNscSelection = await this.myCompendia.getCollectionIndex('npc')
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
            stockNsc: professions.existing,
            packNscSelection,
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
        this.npcImageChoices = undefined
        this.observableData = MeistertoolsUtil.updateByPath(this.observableData, varName, varValue)
        this.render()
    }


    async _saveSettings() {
        const settings = game.settings.get(moduleName, 'settings')
        this.settings.defaultProfession = this.observableData.profession
        game.settings.set(moduleName, 'settings', mergeObject(settings, {nsc: this.settings}))
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find("input[type='checkbox']").change(event => this._handleCheckboxChange(event, html));
        html.find("input[type='text']").change(event => this._handleTextChange(event, html));
        html.find("input[type='radio']").change(event => this._handleTextChange(event, html));
        html.find("select").change(event => this._handleTextChange(event, html));

        html.find("input[name='profession']").change(event => {
            this.observableData.professionName = $(event.currentTarget).attr("data-profession-name")
        });

        html.find("button[name='store-pattern']").click(event => this._storePattern(event, html));
        html.find("button[name='delete-pattern']").click(event => this._deletePattern(event, html));
        html.find("button[name='load-pattern']").click(event => this._loadPattern(event, html));
        html.find("button[name='generate-nsc']").click(event => this._generateNSC(event, html));
        html.find("button[name='generate-name']").click(async event => {
            await this._generateName(event, html);
            this.render()
        });
        html.find("button[name='generate-image']").click(async event => {
            await this._generateImage(event, html);
            this.render()
        });

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
     * callback function for _generateName
     * @param match
     * @param ruleset
     * @param allTables
     * @return draw a random name
     * @private
     */
    async _drawFromMatch(match, ruleset, allTables) {
        try {
            if (Array.isArray(ruleset.tables[match[1]]))
                return ruleset.tables[match[1]][Math.floor(Math.random() * ruleset.tables[match[1]].length)]

            const result = await allTables
                .find(t => t.data.name === ruleset.tables[match[1]])
                .draw({displayChat: false})
            return result.results[0].text
        } catch (e) {
            ui.notifications.error(`Could not find table '${match[1]}' - ${ruleset.tables[match[1]]}`);
            return ""
        }

    }

    _rollGender() {
        let genderChanceM = 0.5
        for (let species of getRuleset().archetypes) {
            let origin = species.origins.find(o => o.key === this.observableData.origin)
            if (origin && origin.gender) {
                if (origin.gender) genderChanceM = origin.gender['m'] / 100
                break
            }
        }
        this.observableData.gender = (Math.random() < genderChanceM) ? 'm' : 'w'
    }


    /**
     * generate random name based on culture / origin  combo
     * @return {Promise<void>}
     * @private
     */
    async _generateName() {
        if (this.observableData.gender === "random")
            await this._rollGender()
        let nameKey = null
        for (let species of getRuleset().archetypes) {
            let origin = species.origins.find(o => o.key === this.observableData.origin)
            if (origin) {
                nameKey = origin.key
                if (origin.cultures) nameKey = origin.cultures.find(c => c.key === this.observableData.culture).key
                break
            }
        }
        const ruleset = getRuleset().randomNameRuleSets[nameKey]
        if (ruleset === undefined) {
            ui.notifications.error(`Keine Regeln zur Generierung von Namen "${nameKey}" definiert. Prüfe '/config/random-name-rule-sets.js'`);
            return
        }
        const allTables = await game.packs.get(moduleName + ".names").getContent()
        let result;
        let name = ruleset.rules ? ruleset.rules[this.observableData.gender] : `_vorname${this.observableData.gender} _nachname`
        let tmpName = name
        const regex = /_([a-z]+)/g  // finds all names of tables
        while ((result = regex.exec(tmpName)) !== null) {
            const resultText = await this._drawFromMatch(result, ruleset, allTables)
            name = name.replace(/(_[a-z]+)/, resultText.trim())     // trims and also removes the '_' char in front of the found match, hence another regex
        }
        this.observableData.nsc_name = name
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
        let posLeft = (Math.ceil(paddingLeft / parseInt(canvas.scene.data.grid))) * tokenSize

        let posCenterX = (Math.ceil((paddingLeft + canvas.scene.data.width / 2) / parseInt(canvas.scene.data.grid))) * tokenSize
        let posCenterY = (Math.ceil((paddingTop + canvas.scene.data.height / 2) / parseInt(canvas.scene.data.grid))) * tokenSize

        let posTop = (Math.ceil(paddingTop / parseInt(canvas.scene.data.grid))) * tokenSize
        let posBottom = (Math.floor((paddingTop + canvas.scene.data.height) / parseInt(canvas.scene.data.grid))) * tokenSize
        let tokenPerRow = Math.floor(canvas.scene.data.width / tokenSize)
        let index = this.lastTokenIndex++
        if (!index) {
            index = 0
            this.lastTokenIndex = 1
        }
        switch (positionType) {
            case TOKEN_POSITION.CENTER:
                return {
                    x: posCenterX + (index % tokenPerRow) * tokenSize,
                    y: posCenterY + Math.floor(index / tokenPerRow) * tokenSize
                }
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

    /*
        todo doesnt consider actor-avatars might be different than token-icon
       todo doenst consider size of actors
     */
    moveActorTokenInScene(actor, position = this.observableData.tokenPosition, vision = false) {
        const tokenPosition = this._getTokenPosition(position)
        let newToken = {
            name: actor.name,
            x: tokenPosition.x,
            y: tokenPosition.y,
            img: actor.img,
            width: 1,
            height: 1,
            vision,
            hidden: false,
            actorId: actor.id,
            actorLink: true,
            actorData: {}
        }
        return canvas.scene.createEmbeddedEntity("Token", newToken)
    }

    async _getImagesByConfig() {
        console.log(moduleName, '| checking for new files with MyFilePicker')
        const FP = new MyFilePicker({type: "image"})
        let professionName = this.observableData.professionName?.split(',')[0]
        const target = `${this.settings.tokenImageFolder}/${this.observableData.origin}/${this.observableData.gender}/${professionName}`
        const images = await FP.browse(target)
        this.npcImageChoices = images.files
    }

    async _generateImage(event, html) {
        if (this.observableData.gender === "random")
            await this._rollGender()
        if (!this.npcImageChoices || this.npcImageChoices === [])
            await this._getImagesByConfig()
        this.observableData.nsc_img = this.npcImageChoices[Math.floor(Math.random() * this.npcImageChoices.length)]
    }


    /**
     * generates NPC based on this.observableData
     * @private
     */
    async _generateNSC(event, html) {
        /* import actor and find token */
        try {
            const randomGender = (this.observableData.gender === "random")
            if (randomGender) this._rollGender()

            /* if no random images or names have been generated we have to do that now */
            if (!this.observableData.nsc_name || this.observableData.nsc_name === "")
                await this._generateName(event, html)
            if (!this.observableData.nsc_img)
                await this._generateImage(event, html)


            // roll how many actors shall be created
            const amount = MeistertoolsUtil.rollDice(this.observableData.anzahl.toString())
            for (let i = 0; i < amount; i++) {
                const actor = await this.myCompendia.getEntities(this.observableData.profession, 'global', 'professions')
                let img = this.observableData.nsc_img;
                let name = this.observableData.nsc_name
                let token = duplicate(actor.data.token);
                token['name'] = name
                token['img'] = img
                await actor.update({name, img, token});
                if (this.observableData.tokenPosition && this.observableData.tokenPosition !== "")
                    await this.moveActorTokenInScene(actor)

                // in case we generate another actor
                if (randomGender) this._rollGender()
                await this._generateName()
                await this._generateImage()
            }

            // after the last one, we reset the generated names and img to null, so we dont reuse the combo
            this.observableData.nsc_name = ""
            this.observableData.nsc_img = null
        } catch (e) {
            console.log(e)
            return ui.notifications.error(`Cant create Actor. Error Details see console`);
        }


        if (this.settings.closeAfterGeneration)
            await this.close()
        this.render()
    }


    async _importSelectedPlayers() {
        const selectedPlayers = Object.keys(this.observableData.playerSelection)
        const entities = await game.actors.filter(p => selectedPlayers.includes(p._id) && this.observableData.playerSelection[p._id] !== false)
        for (let actor of entities)
            this.moveActorTokenInScene(actor, this.observableData.playerTokenPosition, true)
        if (this.settings.closeAfterGeneration)
            await this.close()
        this.render()
    }


    async _importSelectedNpc(event, html) {
        1
        const entities = await this.myCompendia.getEntities(this.observableData.packNscSelection, 'npc')
        for (let actor of entities)
            this.moveActorTokenInScene(actor)

        const stockEntities = await this.myCompendia.getEntities(this.observableData.stockNscSelection, 'global', 'professions')
        for (let actor of stockEntities)
            this.moveActorTokenInScene(actor)

        this.observableData.packNscSelection = {}
        this.observableData.stockNscSelection = {}

        if (this.settings.closeAfterGeneration)
            await this.close()
        this.render()
    }

    static getDefaultSettings() {
        return {
            closeAfterGeneration: true,
            tokenImageFolder: "modules/dsa5-meistertools/images/actor_archetypes",
            defaultOrigin: '',
            defaultCulture: '',
            defaultProfession: '',
            storedPatterns: [],
            genderOptions: [
                {key: 'random', icon: 'fas fa-dice', name: 'zufall'},
                {key: 'w', icon: 'fas fa-venus', name: 'weiblich'},
                {key: 'm', icon: 'fas fa-mars', name: 'männlich'},
            ]
        }
    }

}

export function

getRuleset() {
    return {
        randomNameRuleSets,
        archetypes,
    }
}

