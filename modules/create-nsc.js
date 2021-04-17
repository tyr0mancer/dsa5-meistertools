import {moduleName} from "../dsa5-meistertools.js";
import {Util} from "./Util.js";

const NPC_IMAGE_FOLDER = `modules/dsa5-meistertools/images/actor_archetypes`

export async function createNSC() {
    const app = new CreateNSC()
    app.render(true)
}


class CreateNSC extends Application {

    constructor() {
        super();

        // read settings
        const {nsc: settings} = game.settings.get(moduleName, 'settings')
        this.settings = mergeObject(settings, {
            genderOptions: getDefaultGenderOptions()
        })
        // general options for selection
        let nscSelection = {}
        let playerSelection = {}
        this.players = Util.activePlayers().map(a => {
            playerSelection[a._id] = true
            return {name: a.name, _id: a._id, img: a.img}
        })


        // initial formData state
        this.observableData = {
            origin: settings.defaultOrigin,
            culture: settings.defaultCulture,
            profession: settings.defaultProfession,
            anzahl: "1",
            gender: 'random',
            import: true,
            playerSelection,
            nscSelection,
        }
        this.compendiaProfessions = new Map([['professions', game.packs.get(settings.professionPack)]]);
        this.compendiaNpc = new Map();
        this.settings.packs.forEach(pack => this.compendiaNpc.set(pack.folder, game.packs.get(pack.packname)))
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
        // get index array from scene packs if not done already
        if (!this.packListIndexed) {
            for (const [, pack] of this.compendiaProfessions)
                await pack.getIndex()
            for (const [, pack] of this.compendiaNpc)
                await pack.getIndex()
            this.packListIndexed = true;
        }


        let npcList = []
        console.log(this.compendiaNpc)
        this.compendiaNpc.forEach(p =>
            npcList.push({
                name: p.metadata.label,
                index: p.index
            })
        )


        return {
            data: this.observableData,
            settings: this.settings,
            archetypes: getRuleset().archetypes,
            professions: this.compendiaProfessions.get("professions").index,
            npcList,
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
        this._saveSettings()
        this.render()
    }

    _deletePattern(event, html) {
        this.settings.storedPatterns.splice(parseInt($(event.currentTarget).attr("data-pattern")), 1)
        this._saveSettings()
        this.render()
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
     * Random NSC
     */

    async _importActor(origin, culture, gender, profession, packName, type, extra) {
        const FP = new FilePicker({type: "image"})
        const actor = await game[type].importFromCollection(packName, profession, extra)
        const images = await FP.browse(`${NPC_IMAGE_FOLDER}/${origin}/${gender}/${actor.name}`)
        const img = images.files[Math.floor(Math.random() * images.files.length)];
        const name = this._randomName()
        let token = duplicate(actor.data.token);
        token['name'] = name
        token['img'] = img
        await actor.update({name, img, token});
        let newToken = {
            name: actor.name,
            x: 600,
            y: 400,
            img: actor.img,
            width: 1,
            height: 1,
            vision: false,
            hidden: false,
            actorId: actor.id,
            actorLink: true,
            actorData: {}
        }
        await canvas.scene.createEmbeddedEntity("Token", newToken)
        ui.notifications.info(`${name} erstellt`);
    }

    async _drawFromMatch(match, ruleset, allTables) {
        try {
            const result = await allTables
                .find(t => t.data.name === ruleset.tables[match[1]])
                .draw({displayChat: false})
            return result.results[0].text
        } catch (e) {
            ui.notifications.error(`Could not find pack '${packName}'`);
        }

    }

    async _generateNSC(event, html) {
        console.clear()
        /*
                console.log('generate NSC')
                console.log(JSON.stringify(this.observableData))
        */


        /* find ruleset for culture / origin  combo */
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

        // roll gender if not set
        let gender = this.observableData.gender
        if (gender === 'random')
            gender = await (Math.random() < genderChanceM) ? 'm' : 'w'

        const allTables = await game.packs.get(moduleName + ".names").getContent()
        const reg = /_([a-z]+)/g

        let result;
        let name = ruleset.rules[gender]
        while ((result = reg.exec(ruleset.rules[gender])) !== null) {
            const resultText = await this._drawFromMatch(result, ruleset, allTables)
            name = name.replace(/_([a-z]+)/, resultText)
        }
        console.log(name)

        /*
                const name = ruleString.replace(/_[a-z]+/g, async (match) => {
                    let result = await this.something('asdas')
                    return result
                    /!*
                                const result = await allTables
                                    .find(t => t.data.name === ruleset.tables[match.substr(1)])
                                    .draw({displayChat: false})

                                console.log(result)

                                return "Otto"
                    *!/
                    /!*
                                return new Promise((resolve, reject) => {
                                    allTables
                                        .find(t => t.data.name === ruleset.tables[match.substr(1)])
                                        .draw({displayChat: false})
                                        .then(res => {
                                            console.log(res.results[0].text)
                                            resolve(res.results[0].text)
                                        })
                                        .catch(e => reject('Alrik'))
                                });
                    *!/
                });
                console.log(name)*/


        /*
                console.clear()
                const paragraph = 'The _quick brown fox _jumps over the _lazy dog. It barked.';
                const regex = /_[a-z]+/g;
                const found = paragraph.match(regex);
                console.log(found)

                const name = paragraph.replace(regex, (match) => {
                    console.log(match)

                    return "<" + match.substr(1) + "-ergebnisse>"
                });
                console.log(newstr)
        */

        /*


                const allTables = await game.packs.get(moduleName + ".names").getContent()

                const drawBy = async (tableName) => {
                    console.log(tableName)
                    const table = allTables.find(t => t.data.name === tableName)
                    await table.draw()
                }

                await drawBy(ruleset.tables['asd'])


                const namePack = await game.packs.get(moduleName + ".names");
                await namePack.getIndex()
                console.log('namePack', namePack.index)
        */


        /*
                const {extra, type} = await Util.prepareImport(this.settings.professionPack, this.settings.folder)
                const actor = await game[type].importFromCollection(this.settings.professionPack, this.observableData.profession, extra)
                console.log(actor)
        */

        //console.log(this.settings.professionsPack)

        //console.log(result)


        /*
                const FP = new FilePicker({type: "image"})
                //        const actor = await game['Actor'].importFromCollection(packName, profession, extra)
                const images = await FP.browse(`${NPC_IMAGE_FOLDER}/${this.observableData.origin}/${this.observableData.gender}/${'actor.name'}`)
                //console.log(images)
                FP.close(true)
        */

        /*
            {
              "origin": "mittellande",
              "culture": "albernisch",
              "profession": "1DBRXHsY2rrDKQLK",
              "anzahl": "1",
              "gender": "random",
              "import": true,
            }
        */
    }


    /**
     * Add Tokens to scene
     */
    _importSelectedPlayers(event, html) {
        console.clear()
        console.log('_importSelectedPlayers')
        console.log(JSON.stringify(this.observableData))
    }

    _importSelectedNpc(event, html) {
        console.clear()
        console.log('_importSelectedNpc')
        console.log(JSON.stringify(this.observableData.nscSelection))
    }
}


/* todo move this to settings */
export function

getDefaultGenderOptions() {
    return [
        {key: 'random', icon: 'fas fa-dice', name: 'zufall'},
        {key: 'w', icon: 'fas fa-venus', name: 'weiblich'},
        {key: 'm', icon: 'fas fa-mars', name: 'männlich'},
    ]
}


/* todo move this to settings */
export function

getRuleset() {
    return {
        randomNameRuleSets: {
            "albernisch": {
                tables: {
                    "vornamem": "albernia_vorname_m",
                    "vornamew": "albernia_vorname_w",
                    "nachname": "gareth_nachname"
                },
                rules: {"m": "_vornamem _nachname", "w": "_vornamew _nachname"}
            },
            "garethisch": {
                tables: {
                    "vornamem": "gareth_vorname",
                    "vornamew": "gareth_vorname",
                    "nachname": "gareth_nachname"
                },
                rules: {"m": "_vornamem _nachname", "w": "_vornamew _nachname"}
            },
            "zwerge": {
                tables: {
                    "vornamem": "zwerge_vorname_m",
                    "vornamew": "zwerge_vorname_w",
                },
                rules: {
                    "m": "_vornamem Sohn des _vornamem",
                    "w": "_vornamew Tochter der _vornamew"
                }
            }
        },
        archetypes: [
            {
                name: "Menschen",
                img: 'systems/dsa5/icons/species/Mensch.webp',
                origins: [
                    {
                        key: 'mittellande', name: 'Mittelländer',
                        cultures: [
                            {name: 'Albernisch', key: 'albernisch'},
                            {name: 'Garethisch', key: 'garethisch'},
                            {name: 'Bornländisch', key: 'bornlaendisch'},
                            {name: 'Horasisch', key: 'horasisch'},
                            {name: 'Weidensche', key: 'weidensche'},
                            {name: 'Darpatisch', key: 'darpatisch'}
                        ]
                    },
                    {name: 'Thorwaler', key: 'thorwaler'},
                    {name: 'Norbarden', key: 'norbarden'},
                    {name: 'Tulamiden', key: 'tulamiden'},
                    {name: 'Novadis', key: 'novadis'},
                    {name: 'Nivesen', key: 'nivesen'},
                    {name: 'Moha', key: 'moha'},
                    {name: 'Amazonen', key: 'amazonen'},
                ]
            },
            {
                name: 'Zwerge',
                img: 'systems/dsa5/icons/species/Zwerg.webp',
                origins: [
                    {key: 'zwerge', name: 'Amboss- und Brillantzwerge', gender: {w: 25, m: 75}},
                    {key: 'huegelzwerge', name: 'Hügelzwerge (Kosch)', gender: {w: 25, m: 75}}
                ],
            },
            {
                name: "Elfen",
                img: "systems/dsa5/icons/species/Elf.webp",
                origins: [
                    {key: 'waldelfen', name: 'Waldelfen'},
                    {key: 'halbelfen', name: 'Halbelfen'},
                    {key: 'auelfen', name: 'Auelfen / Firnelfen'}
                ]
            }]
    }
}
