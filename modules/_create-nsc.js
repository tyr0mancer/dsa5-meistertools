import {moduleName} from "../dsa5-meistertools.js";
import {Util} from "./Util.js";

export class CreateNSC extends FormApplication {

    constructor() {
        super();
        //game.settings.set(moduleName, 'settings', undefined)
        const settings = game.settings.get(moduleName, 'settings')
        //console.log(settings.nsc)
        this.moduleSettings = mergeObject(settings.nsc, CreateNSC.getRuleset())


        this.players = Util.activePlayers().map(a => {
            return {name: a.name, _id: a._id}
        })

        // todo aus pack auslesen
/*
        console.log(this.moduleSettings.professionPack)
        console.log(this.moduleSettings.packs)
*/

        this.professionsPack = game.packs.find(t => t.collection === this.moduleSettings.professionPack);
        console.log(compendium)
        this.professions = ['Bürger', 'Bäcker', 'Wirt']
        this.nsc = []

        this.config = {
            profession: this.moduleSettings.defaultProfession,
            origin: this.moduleSettings.defaultOrigin,
            culture: this.moduleSettings.defaultCulture,
            packs: this.moduleSettings.packs,
            anzahl: 1,
            gender: 'random'
        }

        this.storedPatterns = this.moduleSettings.storedPatterns
    }


    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = `Create NSC`;
        options.id = `${moduleName}.create-nsc`;
        options.template = `modules/${moduleName}/templates/create-nsc.html`;
        options.tabs = [{navSelector: ".tabs", contentSelector: ".content", initial: "nsc"}]

        options.resizable = true;
        options.top = 80;
        options.left = 100;
        options.width = 400;
        options.height = 800;
        return options;
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('button[name=\'import-heroes\']').click(event => this._importHeroes(event, html));
        html.find('.select-pattern').click(ev => this._selectPattern(ev));

        html.find('input.pattern-setting').change(event => this._setConfig(event, html));
        html.find('select.pattern-setting').change(event => this._setConfig(event, html));

        html.find('.delete-pattern').click(ev => this._deletePattern(ev));
        html.find('.save-pattern').click(ev => this._savePattern(ev));


    }


    async getData() {
        if (this.professionsPack.index = [])
            await this.professionsPack.getIndex()

        const professions = this.professionsPack.index.map(p => p.name)
        console.log(professions)

        return {
            ...this.config,
            storedPatterns: this.storedPatterns,

            archetypes: this.moduleSettings.archetypes,
            defaultGender: this.moduleSettings.defaultGender,
            professions,

            players: this.players,
        };
    }

    async _setConfig(event, html) {
        /*
                console.log(this.storedPatterns)
                console.log(this.moduleSettings.storedPatterns)
                console.log(this.config)
                console.log(event.target.name)
                console.log(event.target.value)
        */
        this.config[event.target.name] = event.target.value
    }

    async _saveSettings() {
        const settings = game.settings.get(moduleName, 'settings')
        game.settings.set(moduleName, 'settings', mergeObject(settings, {nsc: {storedPatterns: this.moduleSettings.storedPatterns}}))
    }

    async _selectPattern(ev) {
        const patternId = ev.currentTarget.value
        const newConfig = await this.moduleSettings.storedPatterns[patternId].config
        this.config = {
            profession: newConfig.profession,
            origin: newConfig.origin,
            culture: newConfig.culture,
            anzahl: newConfig.anzahl,
            gender: newConfig.gender
        }
        //this.render(true)

        this._updateObject(null, this.config)
        this.close()
    }

    async _deletePattern(ev) {
        const patternId = ev.currentTarget.value
        this.moduleSettings.storedPatterns.splice(patternId, 1)
        await this._saveSettings()
        this.render()
    }

    async _savePattern(ev) {
        const newPattern = {
            name: this.config.patternName,
            config: this.config
        }
        this.moduleSettings.storedPatterns.push(newPattern)
        await this._saveSettings()
        this.render()
    }

    _updateObject(event, formData) {
        //console.log(JSON.stringify(event.currentTarget))
        console.log(JSON.stringify(formData))
        this.close()
    }

    _importHeroes(event, html) {
        // console.clear()
        // console.log(JSON.stringify(event.currentTarget))
        const res = html.find('input[class="player"]')//.each(i => console.log(i))
        // console.log(JSON.stringify(res))
    }


    // todo manage this through settings or move into .json file
    static getRuleset() {
        return {
            defaultGender: [
                {key: 'm', name: 'männlich', chance: '50'},
                {key: 'w', name: 'weiblich', chance: '50'}
            ],
            randomNameRuleSets: {
                "albernia": {
                    tables: {
                        "vorname_m": "vorname_albernia_m",
                        "vorname_w": "vorname_albernia_w",
                        "nachname": "nachname_gareth",
                        "vorlieben": "vorlieben_mittelreich",
                        "geheimnis": "geheimnisse_mittelreich",
                        "beruf": "hintergrund_gareth",
                        "orte": "orte_gareth",
                    },
                    rules: {
                        "m": "$vorname_m $nachname",
                        "w": "$vorname_w $nachname",
                        "background": "Ist aufgewachsen in $orte. Die Eltern waren $beruf. $name hat ein Geheimnis: $geheimnis. $name hat Vorlieben: $geheimnis"
                    }
                },
                "gareth": {
                    tables: {
                        "vorname_m": "vorname_garethi",
                        "vorname_w": "vorname_garethi",
                        "nachname": "nachname_garethi"
                    },
                    rules: {
                        "m": "$vorname_m $nachname",
                        "w": "$vorname_w $nachname"
                    }
                }
            },
            archetypes: [
                {
                    isDefault: true,
                    key: 'mittellande',
                    name: 'Mittelländer',
                    defaultCulture: 'gareth',
                    cultures: [
                        {key: 'albernia', name: 'Albernia'},
                        {key: 'gareth', name: 'Gareth'}
                    ],
                    gender: this.defaultGender
                },
                {
                    key: 'zwerge',
                    name: 'Zwerge',
                    gender: [
                        {key: 'm', name: 'männlich', chance: '80'},
                        {key: 'w', name: 'weiblich', chance: '20'}
                    ]
                },
                {
                    key: 'huegelzwerge',
                    name: 'Hügel Zwerge',
                    gender: [
                        {key: 'm', name: 'männlich', chance: '80'},
                        {key: 'w', name: 'weiblich', chance: '20'}
                    ]
                }
            ]
        }
    }


    static getDefaultSettings() {

        // todo manage this through settings
        return {
            defaultOrigin: '',
            defaultCulture: '',
            defaultProfession: '',
            storedPatterns: []
        }

        /*
        return {
            defaultOrigin: 'huegelzwerge',
            defaultCulture: 'gareth',
            defaultProfession: 'Bäcker',
            storedPatterns: [
                {
                    name: '2 Albernische WirtInnen',
                    config: {
                        count: 2,
                        gender: 'random',
                        origin: 'mittellande',
                        culture: 'albernia',
                        profession: 'Wirt'
                    }
                },
                {
                    name: '5 ZwergInnen',
                    config: {
                        count: 5,
                        gender: 'random',
                        origin: 'zwerge',
                        culture: '',
                        profession: 'Bäcker'
                    }
                }
            ]
        }
*/

    }

}

