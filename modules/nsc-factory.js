import mstrtls from "../config/meistertools-config.js"
import {Meistertools} from "../meistertools.js";
import defaultSettings from "../config/nsc-factory.config.js";


import {FileBrowser} from "../util/file-browser.js";
import {MeisterApplication} from "../util/meister-application.js";

const MIN_AMOUNT = 1
const DEFAULT_IMAGE = '404.jpeg'
const JOBLESS_PROFESSIONS = ["Bürger"]

export default class NscFactory extends MeisterApplication {

    static get meisterModule() {
        return {name: "NSC Fabrik", icon: "fas fa-user-friends", key: "nsc-factory", class: NscFactory}
    }

    constructor(moduleKey = NscFactory.meisterModule.key) {
        super(moduleKey);
        this.settings = game.settings.get(mstrtls.moduleName, 'nsc-factory') || NscFactory.defaultSettings || {}
        this.selection = this.settings.lastSelection || {}
        this.professionCompendium = game.packs.get(this.settings.settings?.baseActorCollection)
        this.rollTablesCompendium = game.packs.get(this.settings.settings?.rolltablesCollection)

        Hooks.on(mstrtls.moduleName + ".update-settings", (settings) => {
            this.settings = settings['nsc-factory']
            this.professionCompendium = game.packs.get(this.settings.settings?.baseActorCollection)
            this.render()
        });
    }


    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: `modules/${mstrtls.moduleName}/templates/nsc-factory.hbs`,
            title: game.i18n.localize('Meistertools.NscFactory'),
            id: `${mstrtls.moduleName}.nsc-factory`,
            tabs: [{navSelector: ".tabs", contentSelector: ".content", initial: "nsc-generator"}], //nsc-generator  existing-actors
            resizable: true, popOut: true,
            width: 560,
            height: 800,
            closeOnSubmit: false,
            submitOnClose: true,
        });
    }

    activateListeners(html) {
        super.activateListeners(html);
        Meistertools.addDefaultListeners(html, {onChange: e => this._handleDataChange(e)});
        html.find("BUTTON[NAME=insert-player]").click((event) => this._insertPlayer(event))
        html.find("BUTTON[NAME=insert-existing-nsc]").click((event) => this._insertExistingNsc(event))
        html.find(".handle-pattern").click((event) => this._handlePattern(event))
        html.find(".change-amount").click((event) => this._changeAmount(event))
        html.find(".create-preview").click(() => this._createPreview())
        html.find(".create-nsc").click(() => this._createNsc())
        html.find(".re-roll").click((event) => this._reRoll(event))
    }

    async getData() {
        const data = await super.getData();
        if (!this.professionCompendium?.index?.length) {
            await this.professionCompendium?.getIndex()
        }
        mergeObject(data, {
            settings: this.settings,
            selection: this.selection,
            preview: this.preview,
            selectionDisplay: await this._displaySelection(),
            selectOptions: {
                playerActors: Meistertools.playerActors,
                generatedNsc: game.folders.find(f => f.name === this.settings.settings?.folderName && f.type === this.professionCompendium?.entity)?.entities,
                scenePositions: SCENE_POSITIONS,
                professionCompendium: this.professionCompendium?.index || [],
            }
        })
        return data;
    }


    /*

        async _updateObject(event, formData) {
            const lastSelection = Meistertools.expandObjectAndArray(formData)
            this.settings = this._updateSettings({
                lastSelection: {...lastSelection}
            })
        }
    */


    /**
     * creates an array of nsc settings upon which to create the actors and updates this.preview
     * this.preview is an array whose elements are objects of type {img: string, gender: string, origin: string, name: string, eyes: string, height: string}
     * @return {Promise<void>}
     * @private
     */
    async _createPreview() {
        const amount = Meistertools.rollDice(this.selection.amount.toString())
        const archetypeData = duplicate(this.settings.fallbackData)
        const archetype = this.settings.archetypes.find(a => a.key === this.selection.archetype)
        if (archetype?.data)
            mergeObject(archetypeData, archetype.data)
        archetypeData.species = this.settings.species.find(s => s.key === archetype?.species)
        const variation = archetype?.variations?.find(v => v.key === this.selection.variation)
        if (variation?.data) {
            mergeObject(archetypeData, variation.data)
            mergeObject(archetypeData, {variation})
        }
        mergeObject(archetypeData, {archetype})


        const professionActor = this.professionCompendium.index.find(e => e._id === this.selection?.profession)
        if (!professionActor) {
            ui.notifications.info(`Profession wählen`);
            return
        }
        professionActor.collection = this.professionCompendium?.collection
        const archetypeActor = await game.packs.get(archetypeData.actor?.collection)?.getDocument(archetypeData.actor._id)

        this.preview = {
            professionActor,
            archetypeActor,
            selection: duplicate(this.selection),
            archetypeData,
            results: []
        }

        for (let i = 0; i < amount; i++)
            this.preview.results.push(await this._rollActorMeta(archetypeData, professionActor, archetypeActor))

        this.render()
    }


    /**
     *
     * @param actorA
     * @param actorB
     * @return {Promise<*>}
     * @private
     */
    async _mergeActor(actorA, actorB) {
        // todo merge actorB (=archetypeActor) into actorA
        return actorA
    }


    /**
     *
     * @return {Promise<*>}
     * @private
     */
    async _createNsc() {
        if (!this.preview)
            await this._createPreview()

        const {id: folderId} = await Meistertools.getFolder(this.settings.settings?.folderName, this.professionCompendium.entity)

        for (let newActor of this.preview.results) {
            const actor = await game.actors.importFromCollection(this.preview.professionActor.collection, this.preview.professionActor._id, folderId ? {folder: folderId} : null)
            await this._mergeActor(actor, this.preview.archetypeActor)
            await actor.update({
                "name": newActor.name,
                "img": newActor.img,
                "token.name": newActor.name,
                "token.img": newActor.img,
                "data.details.species.value": this.preview.archetypeData.species?.name,
                "data.details.eyecolor.value": newActor.eyecolor,
                "data.details.haircolor.value": newActor.haircolor,
                "data.details.Home.value": newActor.origin,
                "data.details.gender.value": newActor.genderName,
                "data.details.career.value": newActor.career,
                "data.details.culture.value": newActor.culture,
                "data.details.height.value": newActor.height,
                "data.details.weight.value": newActor.weight,
                "data.details.age.value": newActor.age,
                "data.details.biography.value": `<p>Zitat: <i>"${newActor.catchphrase}"</i></p>`,
                "data.details.distinguishingmark.value": newActor.characterTrait,
            })
            await this._createActorTokenInCanvas(actor, this.selection.position)
        }

        this.preview = false
        if (this.settings.settings.closeAfterGeneration)
            return this.close()
        return this.render()
    }


    /**
     *
     * @return {Promise<*>}
     * @private
     */
    async _insertPlayer() {
        for (const {actor} of Meistertools.playerActors.filter(e => this.selection.players.selection[e.actor._id]))
            await this._createActorTokenInCanvas(actor, this.selection.players.position)
        if (this.settings.settings.closeAfterGeneration)
            return this.close()
    }

    /**
     *
     * @param event
     * @return {Promise<*>}
     * @private
     */
    async _insertExistingNsc(event) {
        for (const actor of game.folders
            .find(f => f.name === this.settings.settings?.folderName && f.type === this.professionCompendium.entity)?.entities
            .filter(e => this.selection["existing-nsc"].selection[e._id]))
            await this._createActorTokenInCanvas(actor, this.selection["existing-nsc"].position)
        if (this.settings.settings.closeAfterGeneration)
            return this.close()
    }


    /**
     *
     * @param actor
     * @param position
     * @param options
     * @return {*}
     * @private
     */
    async _createActorTokenInCanvas(actor, position, options = {actorLink: true, hidden: false}) {
        if (position === "none") return
        if (typeof position === "string")
            position = this._getTokenPosition(position)
        const newToken = {
            ...actor.data.token,
            ...position,
            ...options,
            name: actor.name,
            img: actor.img,
            actorId: actor.id,
            width: 1,
            height: 1
        }
        return await game.scenes.viewed.createEmbeddedEntity("Token", newToken)
    }

    /**
     * calculates the next position for a token and increases this.lastTokenIndex
     * @param positionType
     * @return {{x: number, y: number}}
     * @private
     */
    _getTokenPosition(positionType = 'top-left') {
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
            case "center":
                return {
                    x: posCenterX + (index % tokenPerRow) * tokenSize,
                    y: posCenterY + Math.floor(index / tokenPerRow) * tokenSize
                }
            case "top-left":
                return {
                    x: posLeft + (index % tokenPerRow) * tokenSize,
                    y: posTop + Math.floor(index / tokenPerRow) * tokenSize
                }
            case "bottom-left":
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


    /**
     * change current amount and adjust preview
     * @param event
     * @private
     */
    _changeAmount(event) {
        const delta = parseInt($(event.currentTarget).attr("data-delta")) || 1
        // this.selection.amount is a string that only contains digits
        if (/^\d+$/.test(this.selection.amount)) {
            this.selection.amount = (parseInt(this.selection.amount) + delta)
            if (this.selection.amount < MIN_AMOUNT) this.selection.amount = MIN_AMOUNT
            this.selection.amount = this.selection.amount.toString()
        }
        if (!this.selection.amount) this.selection.amount = MIN_AMOUNT.toString()
        $('#amount').val(this.selection.amount)
    }

    /**
     * stores, loads or removes entries from storedPatterns and syncs it with settings
     * @param event
     * @private
     */
    async _handlePattern(event) {
        const id = event.id || parseInt($(event.currentTarget).attr("data-pattern-id"))
        const action = event.action || $(event.currentTarget).attr("data-action") || "load"
        if (action === 'load') {
            this.selection = duplicate(this.settings.storedPattern[id])
            return this._createPreview()
        }
        let storedPattern = this.settings.storedPattern || []
        if (action === 'remove')
            storedPattern.splice(id, 1)
        if (action === 'store') {
            storedPattern.push(duplicate(this.selection))
            storedPattern = storedPattern.sort((a, b) => {
                if (a.patternName < b.patternName) return -1
                if (b.patternName < a.patternName) return 1
                return 0
            })
        }
        this.settings = this._updateSettings({storedPattern})
        return this.render()
    }

    /**
     * change handler for form data
     * @param event
     * @return {Promise<void>}
     * @private
     */
    async _handleDataChange(event) {
        let obj = {}
        obj[event.currentTarget.name] = (event.currentTarget.type === "checkbox") ? event.currentTarget.checked : event.currentTarget.value
        await mergeObject(this.selection, Meistertools.expandObjectAndArray(obj))
        $('#nsc-selection').html(this._displaySelection())
    }

    /**
     * merge current settings with update object and store settings
     * @param updateObject
     * @return {any|{}}
     * @private
     */
    _updateSettings(updateObject) {
        console.log(updateObject)
        const settings = game.settings.get(mstrtls.moduleName, 'nsc-factory') || NscFactory.defaultSettings || {}
        game.settings.set(mstrtls.moduleName, 'nsc-factory', mergeObject(settings, updateObject))
        return settings
    }

    /**
     * create html formatted string to display the current NPC selection in the header
     * @param selection
     * @return {string}
     * @private
     */
    _displaySelection(selection = this.selection || {}) {
        let html_string = ``
        // species and culture
        const archetype = this.settings.archetypes?.find(a => a.key === this.selection?.archetype) || false
        const variation = archetype?.variations?.find(v => v.key === selection?.variation) || false
        if (archetype) {
            html_string += `<div class="archetype ${archetype.key}"><img src="${archetype.img}" alt="${archetype.name}" /><label><b>${archetype.name}</b>`
            if (variation)
                html_string += `<br/><i>${variation.name}</i>`
            html_string += `</label></div>`
        }
        // profession
        const profession = this.professionCompendium?.index.find(a => a._id === selection.profession)
        const [proName, proSkill] = profession?.name?.split(',') || []
        if (profession) {
            html_string += `<div class="profession"><img src="${profession.img}" /><label><b>${proName}</b>`
            if (proSkill)
                html_string += `<br/><i>${proSkill}</i>`
            html_string += `</label></div>`
        }
        // gender
        const gender = this.settings.gender?.find(g => g.key === selection.gender) || false
        if (gender) {
            html_string += `<div class="gender ${gender.key}"><i class="${gender.icon}"> </i></div>`
        }
        return html_string;
    }

    /**
     * @param genderRatio [[genderKey:string, weight:number]]
     * @return genderKey>string
     */
    _rollGender(genderRatio) {
        let sum = 0 // should be 100, but who knows
        const rolltable = genderRatio.map(e => {
            return {min: sum, max: (sum += e[1]) - 1, value: e[0]}
        })
        const roll = Math.floor(Math.random() * sum)
        return rolltable.find(e => roll >= e.min && roll <= e.max).value
    }


    async _rollTraits(archetypeData, gender, professionName) {
        const characterTrait = await this._followPattern(archetypeData.pattern.characterTrait, archetypeData.rollTables, gender)
        const catchphrase = await this._followPattern(archetypeData.pattern.catchphrase, archetypeData.rollTables, gender)
        const origin = await this._followPattern(archetypeData.pattern.origin, archetypeData.rollTables, gender)
        return {characterTrait, catchphrase, origin}
    }


    /**
     * selects a random image from deepest possible directory based on selection
     * @param archetypeData
     * @param gender
     * @param professionName
     * @return {Promise<{img: (Error|*|string), weight: *, eyecolor: string, haircolor: string, age: *, height: *}>}
     * @private
     */
    async _rollAppearance(archetypeData, gender, professionName) {
        let folderName = archetypeData.images
        if (gender)
            folderName += '/' + gender
        if (professionName) {
            folderName += '/' + Meistertools.stringToKey(professionName)
        }
        const folder = await new FileBrowser().browse(folderName)
        const img = (folder.files.length) ? Meistertools.drawFromArray(folder.files) : DEFAULT_IMAGE

        // todo auf basis von img name einschränken oder anpassen
        const age = await Meistertools.rollDice(archetypeData.pattern.age)
        const height = await Meistertools.rollDice(archetypeData.pattern.height)
        const weight = height - await Meistertools.rollDice(archetypeData.pattern.weightSubtrahend)
        const eyecolor = await this._followPattern(archetypeData.pattern.eyecolor, archetypeData.rollTables, gender)
        const haircolor = await this._followPattern(archetypeData.pattern.haircolor, archetypeData.rollTables, gender)

        return {img, height, weight, eyecolor, haircolor, age}
    }


    /**
     *
     * @param rollTables
     * @param match
     * @return {string}
     * @private
     */
    async _getFromDataSource(rollTables, match) {
        if (Array.isArray(rollTables[match]))   // data source is a constant array
            return Meistertools.drawFromArray(rollTables[match])
        if (!this.rollTablesCompendium) {
            ui.notifications.error(`Could not find rolltable collection`);
            return
        }
        if (this.rollTablesCompendium.index.length === 0) // data source is a rolltable, if necessary get index
            await this.rollTablesCompendium.getIndex()
        const tableId = this.rollTablesCompendium.index.map(x => x).find(e => e.name === rollTables[match])?._id
        if (!tableId) return ''
        const table = await this.rollTablesCompendium.getDocument(tableId)
        const result = await table?.draw({displayChat: false})
        return result?.results?.length ? result.results[0].data.text : ""
    }


    /**
     *
     * @param pattern
     * @param gender
     * @param rollTables
     * @return {Promise<string>}
     * @private
     */
    async _followPattern(pattern, rollTables, gender = '') {
        if (!pattern || !rollTables) return ''
        const genderedPattern = pattern.replace(/gender/g, gender)
        return Meistertools.asyncStringReplace(genderedPattern, /\${([a-zA-Z_-]+)}/g, (originalString, match) => this._getFromDataSource(rollTables, match))
    }


    /**
     *
     * @param archetypeData
     * @param gender
     * @return {Promise<string>}
     */
    async _rollName(archetypeData, gender) {
        return await this._followPattern(archetypeData.pattern.name, archetypeData.rollTables, gender)
    }


    /**
     *
     * @param archetypeData
     * @param professionActor
     * @param archetypeActor
     * @return {Promise<{gender: *, name: string}>}
     * @private
     */
    async _rollActorMeta(archetypeData, professionActor, archetypeActor) {
        const gender = duplicate(this.selection.gender)
        const result = {gender, name: 'Alrik', career: professionActor.name}
        if (result.gender === 'random')
            result.gender = this._rollGender(archetypeData.pattern.genderRatio)
        result.genderName = this.settings.gender?.find(g => g.key === result.gender)?.name
        result.culture = archetypeData.variation?.name || archetypeData.archetype?.name

        if (JOBLESS_PROFESSIONS.includes(result.career))
            result.career = await this._followPattern(archetypeData.pattern.career, archetypeData.rollTables, gender)

        result.name = await this._rollName(archetypeData, result.gender)
        const appearance = await this._rollAppearance(archetypeData, result.gender, result.career)
        const traits = await this._rollTraits(archetypeData, result.gender, result.career)

        mergeObject(result, {...appearance, ...traits})
        return result;
    }


    /**
     *
     * @param event
     * @return {Promise<void>}
     * @private
     */
    async _reRoll(event) {
        const id = $(event.currentTarget).attr("data-result-id")
        const key = $(event.currentTarget).attr("data-result-key")
        if (!id || !key) return
        if (key === 'name') {
            const name = await this._rollName(this.preview.archetypeData, this.preview.results[id].gender)
            mergeObject(this.preview.results[id], {name})
        }
        if (key === 'img') {
            const image = await this._rollAppearance(this.preview.archetypeData, this.preview.results[id].gender, this.preview.results[id].career)
            mergeObject(this.preview.results[id], {...image})
        }
        if (key === 'traits') {
            const traits = await this._rollTraits(this.preview.archetypeData, this.preview.results[id].gender, this.preview.results[id].career)
            mergeObject(this.preview.results[id], {...traits})
        }
        this.render()
    }


    /**
     * default settings from config/nsc-factory.config.js
     * @return {{settings:{}, archetypes:{}}}
     */
    static get defaultSettings() {
        return defaultSettings
    }


}

const SCENE_POSITIONS = [
    {
        key: 'top-left',
        name: 'oben links',
        description: 'Innerhalb der sichtbaren Szene am oberen linken Rand',
    },
    {
        key: 'outside',
        name: 'außen',
        description: 'Außerhalb des sichtbaren Bereichs der Szene',
    },
    {
        key: 'bottom-left',
        name: 'unten links',
        description: 'Innerhalb der sichtbaren Szene am unteren linken Rand',
    },
    {
        key: 'center',
        name: 'mitte',
        description: 'In der Mitte der Szene',
    },
    {
        key: 'none',
        name: 'gar nicht',
        description: 'Token nicht in Szene platzieren',
    },

]
