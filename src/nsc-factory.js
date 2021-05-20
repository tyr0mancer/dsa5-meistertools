import {moduleName} from "../meistertools.js";
import {FileBrowser, MeistertoolsUtil} from "../meistertools-util.js";
import defaultSettings from "../config/nsc-factory.config.js";

const MIN_AMOUNT = 1
const DEFAULT_IMAGE = '404.jpeg'
const JOBLESS_PROFESSIONS = ["Bürger"]

export class NscFactory extends FormApplication {
    constructor() {
        super();
        this.preview = []
        this.settings = game.settings.get(moduleName, 'nsc-factory') || NscFactory.defaultSettings || {}
        this.selection = this.settings.lastSelection || {}
        this.professionCompendium = game.packs.get(this.settings.settings?.baseActorCollection)
        this.rollTablesCompendium = game.packs.get(moduleName + ".rolltable-names")

        Hooks.on(moduleName + ".update-settings", (settings) => {
            this.settings = settings['nsc-factory']
            this.professionCompendium = game.packs.get(this.settings.settings?.baseActorCollection)
            this.render()
        });
    }

    static get defaultOptions() {
        const position = game.settings.get(moduleName, 'nsc-factory').position || {
            top: 80, left: 100, width: 530, height: 800,
        }
        return mergeObject(super.defaultOptions, {
            template: `modules/${moduleName}/templates/nsc-factory.hbs`,
            title: game.i18n.localize('meistertools.nsc-factory'),
            id: `${moduleName}.nsc-factory`,
            tabs: [{navSelector: ".tabs", contentSelector: ".content", initial: "nsc-generator"}],
            resizable: true, popOut: true,
            ...position,
            closeOnSubmit: false,
            submitOnClose: true,
        });
    }

    activateListeners(html) {
        super.activateListeners(html);
        MeistertoolsUtil.addDefaultListeners(html, {onChange: e => this._handleDataChange(e)});

        html.find(".handle-pattern").click((event) => this._handlePattern(event))
        html.find(".change-amount").click((event) => this._changeAmount(event))
        html.find(".create-preview").click(() => this._createPreview())
        html.find(".create-nsc").click(() => this._createNsc())
        html.find(".re-roll").click((event) => this._reRoll(event))

    }

    async getData() {
        if (!this.professionCompendium?.index?.length) {
            await this.professionCompendium?.getIndex()
        }
        this.selectionDisplay = await this._displaySelection()
        return {
            settings: this.settings,
            selection: this.selection,
            preview: this.preview,
            selectionDisplay: this.selectionDisplay,
            selectOptions: {
                scenePositions: SCENE_POSITIONS,
                professionCompendium: this.professionCompendium?.index || [],
            }
        };
    }

    async _updateObject(event, formData) {
        const lastSelection = MeistertoolsUtil.expandObjectAndArray(formData)
        this.settings = this._updateSettings({
            lastSelection: {...lastSelection, position: this.selection.position},
            position: this.position
        })
    }

    /**
     * creates an array of nsc settings upon which to create the actors and updates this.preview
     * this.preview is an array whose elements are objects of type {img: string, gender: string, origin: string, name: string, eyes: string, height: string}
     * @private
     */
    async _createPreview() {
        const amount = MeistertoolsUtil.rollDice(this.selection.amount.toString())

        const archetypeData = duplicate(this.settings.fallbackData)
        const archetype = this.settings.archetypes.find(a => a.key === this.selection.archetype)
        if (archetype?.data)
            mergeObject(archetypeData, archetype.data)
        const variation = archetype?.variations?.find(v => v.key === this.selection.variation)
        if (variation?.data)
            mergeObject(archetypeData, variation.data)

        const professionActor = await this.professionCompendium.getEntry(this.selection.profession)
        const archetypeActor = await game.packs.get(archetypeData.actor.collection).getEntry(archetypeData.actor._id)

        /*
                console.log(professionActor)
                console.log(archetypeActor)
        */
        // todo merge actors ?

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

    async _createNsc() {
        await this._createPreview()
        return undefined;
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
            return this.render()
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
        obj[event.currentTarget.name] = event.currentTarget.value
        await mergeObject(this.selection, MeistertoolsUtil.expandObjectAndArray(obj))
        $('#nsc-selection').html(this._displaySelection())
    }

    /**
     * merge current settings with update object and store settings
     * @param updateObject
     * @return {any|{}}
     * @private
     */
    _updateSettings(updateObject) {
        const settings = game.settings.get(moduleName, 'nsc-factory') || NscFactory.defaultSettings || {}
        game.settings.set(moduleName, 'nsc-factory', mergeObject(settings, updateObject))
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
     * default settings from config/nsc-factory.config.js
     * @return {{settings:{}, archetypes:{}}}
     */
    static get defaultSettings() {
        return defaultSettings
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
        const physicalTrait = await this._followPattern(archetypeData.pattern.physicalTrait, archetypeData.rollTables, gender)
        const catchphrase = await this._followPattern(archetypeData.pattern.catchphrase, archetypeData.rollTables, gender)
        const origin = await this._followPattern(archetypeData.pattern.origin, archetypeData.rollTables, gender)
        const job = (JOBLESS_PROFESSIONS.includes(professionName))
            ? await this._followPattern(archetypeData.pattern.job, archetypeData.rollTables, gender)
            : professionName
        return {physicalTrait, catchphrase, origin, job}
    }

    /**
     * selects a random image from deepest possible directory based on selection
     * @param archetypeData
     * @param gender
     * @param professionName
     * @return image:string
     */
    async _rollImage(archetypeData, gender, professionName) {
        let folderName = archetypeData.images
        if (gender)
            folderName += '/' + gender
        if (professionName) {
            folderName += '/' + MeistertoolsUtil.stringToKey(professionName)
        }
        const folder = await new FileBrowser().browse(folderName)
        const img = (folder.files.length) ? MeistertoolsUtil.drawFromArray(folder.files) : DEFAULT_IMAGE

        // todo auf basis von img name einschränken oder anpassen
        const age = await MeistertoolsUtil.rollDice(archetypeData.pattern.age)
        const height = await MeistertoolsUtil.rollDice(archetypeData.pattern.height)
        const weight = await MeistertoolsUtil.rollDice(archetypeData.pattern.weight)
        const eyes = await this._followPattern(archetypeData.pattern.eyes, archetypeData.rollTables, gender)
        const hair = await this._followPattern(archetypeData.pattern.hair, archetypeData.rollTables, gender)

        return {img, height, weight, eyes, hair, age}
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
            return MeistertoolsUtil.drawFromArray(rollTables[match])
        if (!this.rollTablesCompendium) {
            ui.notifications.error(`Could not find rolltable collection`);
            return
        }
        if (this.rollTablesCompendium.index.length === 0) // data source is a rolltable, if necessary get index
            await this.rollTablesCompendium.getIndex()
        const tableId = this.rollTablesCompendium.index.find(e => e.name === rollTables[match])?._id
        if (!tableId) return ''
        const table = await this.rollTablesCompendium.getEntry(tableId)
        return MeistertoolsUtil.drawFromArray(table.results)?.text
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
        return MeistertoolsUtil.asyncStringReplace(genderedPattern, /\${([a-zA-Z_-]+)}/g, (originalString, match) => this._getFromDataSource(rollTables, match))
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
        const result = {gender, name: 'Alrik'}
        if (result.gender === 'random')
            result.gender = this._rollGender(archetypeData.pattern.genderRatio)
        result.name = await this._rollName(archetypeData, result.gender)
        const image = await this._rollImage(archetypeData, result.gender, professionActor?.name)
        mergeObject(result, {...image})
        const traits = await this._rollTraits(archetypeData, result.gender, professionActor?.name)
        mergeObject(result, {...traits})
        return result;
    }

    async _reRoll(event) {
        const id = $(event.currentTarget).attr("data-result-id")
        const key = $(event.currentTarget).attr("data-result-key")
        if (!id || !key) return
        if (key === 'name') {
            const name = await this._rollName(this.preview.archetypeData, this.preview.results[id].gender)
            mergeObject(this.preview.results[id], {name})
        }
        if (key === 'img') {
            const image = await this._rollImage(this.preview.archetypeData, this.preview.results[id].gender, this.preview.professionActor?.name)
            mergeObject(this.preview.results[id], {...image})
        }
        if (key === 'traits') {
            const traits = await this._rollTraits(this.preview.archetypeData, this.preview.results[id].gender, this.preview.professionActor?.name)
            mergeObject(this.preview.results[id], {...traits})
        }
        this.render()
    }
}


const SCENE_POSITIONS = [
    {
        key: 'none',
        name: 'gar nicht',
        description: 'Token nicht in Szene platzieren',
    },
    {
        key: 'outside',
        name: 'außen',
        description: 'Außerhalb des sichtbaren Bereichs der Szene',
    },
    {
        key: 'top-left',
        name: 'oben links',
        description: 'Innerhalb der sichtbaren Szene am oberen linken Rand',
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
]