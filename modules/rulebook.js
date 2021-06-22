import {Meistertools, moduleName} from "../meistertools.js";
import {MeisterApplication} from "../util/meister-application.js";

export default class RuleBook extends MeisterApplication {

    static get meisterModule() {
        return {name: "Regelbuch", icon: "fas fa-book", key: "rulebook", class: RuleBook}
    }

    constructor(moduleKey = RuleBook.meisterModule.key) {
        super(moduleKey);
        //this.journals = game.packs.get(moduleName + ".journal-regeln")
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['meistertools'],
            width: 740,
            height: 650,
            resizable: true,
            template: `modules/${moduleName}/templates/rulebook.hbs`,
            id: 'meistertools.rulebook',
            title: 'Proben Anfordern',
            closeOnSubmit: false,
            submitOnClose: false,
        });
    }


    static parseRuleBook(journal) {
        const {name, img} = journal.data
        const ruleBook = {name, img, actions: []}

        $(journal.data.content).find('div.rb-action').each((i, action) => {
            let name = $(action).find('h1')?.[0]?.innerText
            let text = $(action).find('p')?.[0]?.innerText
            let source = {
                name: $(action).find('a.rb-source')?.[0].innerText,
                href: $(action).find('a.rb-source')?.[0].href
            }
            let requests = []
            $(action).find('div.rb-request').each((j, request) => {
                //console.log(request)
                let name = $(request).find('h2')?.[0]?.innerText
                let text = $(request).find('p')?.[0]?.innerText

                let variations = []
                $(request).find('table.rb-request-variations tr').each((k, variation) => {
                    //console.log(variation)
                    let name = $(variation).find('td.rb-variation-name')?.[0]?.innerText
                    if (!name) return

                    let roll = $(variation).find('td.rb-variation-roll')?.[0]?.innerText
                    if (!roll) return
                    const match = /@Rq\[(.*) (-?\+?\d*)]/.exec(roll)
                    roll = match[1]
                    let baseModifier = match[2]

                    let modifierOptions = $(variation).find('td.rb-variation-modifier')?.[0]?.innerText.split(',') || []
                    let duration = $(variation).find('td.rb-variation-duration')?.[0]?.innerText
                    variations.push({name, roll, baseModifier, modifierOptions, duration})
                })

                let consequences = []
                $(request).find('table.rb-outcome tr').each((l, outcome) => {
                    //console.log(outcome)
                    let result = $(outcome).find('td.rb-roll-result')?.[0]?.innerText
                    if (!result) return
                    let consequence = $(outcome).find('td.rb-consequence')?.[0]?.innerText
                    consequences.push({result, consequence})
                })

                requests.push({name, text, variations, consequences})
            })
            ruleBook.actions.push({name, text, source, requests})
        })

        return ruleBook
    }

    async getData() {
        /*
                if (!this.regeln)
                    this.regeln = await this.journals?.getContent() || []
                console.log(this.regeln)
        */

        const journal = game.journal.get("gzpah7JJlhYvSVIr")
        this.regeln = RuleBook.parseRuleBook(journal)

        return {
            regeln: this.regeln,
            options: {
                players: game.users.entities.filter(u => !u.isGM && u.character)
            },
            selection: {
                players: [],
            }
        }
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find("button").click(event => {
            const requestIndex = $(event.currentTarget).attr("data-request-index")
            const actionIndex = $(event.currentTarget).attr("data-action-index")
            const request = $(event.currentTarget).attr("data-request")

            const players = []
            html.find("input:checked").each((j, entry) => {
                const prefix = `player-${actionIndex}-`
                if (!entry.name.startsWith(prefix)) return
                players.push(entry.name.substr(prefix.length))
            })

            let modifier = 0
            html.find("input,select").each((j, entry) => {
                const prefix = `modifier-${requestIndex}`
                if (!entry.name.startsWith(prefix)) return
                modifier += parseInt(entry.value) || 0
            })

            console.log(players, request, modifier)

        })
    }

}
