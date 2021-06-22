import {Meistertools, moduleName} from "../meistertools.js";
import {MeisterApplication} from "../util/meister-application.js";

export default class RuleBook extends MeisterApplication {

    static get meisterModule() {
        return {name: "Regelbuch", icon: "fas fa-book", key: "rulebook", class: RuleBook}
    }

    constructor(moduleKey = RuleBook.meisterModule.key) {
        super(moduleKey);
        this.journals = game.packs.get(moduleName + ".journal-regeln") || []
        this.selections = {}
        this.currentRule = "talents"
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['meistertools'],
            width: 900,
            height: 600,
            resizable: true,
            template: `modules/${moduleName}/templates/rulebook.hbs`,
            id: 'meistertools.rulebook',
            title: 'Proben Anfordern',
            closeOnSubmit: false,
            submitOnClose: false,
        });
    }


    static parseRuleBook(journal) {
        if (!journal) return
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
                let name = $(request).find('h2')?.[0]?.innerText
                let text = $(request).find('p')?.[0]?.innerText

                let variations = []
                $(request).find('table.rb-request-variations tr').each((k, variation) => {
                    let name = $(variation).find('td.rb-variation-name')?.[0]?.innerText
                    if (!name) return

                    let talent = $(variation).find('td.rb-variation-talent')?.[0]?.innerText
                    if (!talent) return
                    const match = /@Rq\[(.*) (-?\+?\d*)]/.exec(talent)
                    talent = match[1]
                    let baseModifier = match[2] || 0

                    let modifierOptions = $(variation).find('td.rb-variation-modifier')?.[0]?.innerText.split(',') || []
                    let duration = $(variation).find('td.rb-variation-duration')?.[0]?.innerText
                    variations.push({name, talent, baseModifier, modifierOptions, duration})
                })

                let consequences = []
                $(request).find('table.rb-outcome tr').each((l, outcome) => {
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
        if (!this.skillGroups) {
            this.skillGroups = []
            this.skills = await game.packs.get("dsa5.skills").getContent()
            this.skills = this.skills.sort((a, b) => Meistertools.strcmp(a.name, b.name))

            for (const skill of this.skills) {
                let groupName = skill.data.data.group.value
                let group = this.skillGroups.find(g => g.name === groupName)
                if (!group) {
                    this.skillGroups.push({name: groupName, skills: []})
                    group = this.skillGroups[this.skillGroups.length - 1]
                }
                group.skills.push(skill.name)
            }
            this.skills = this.skills.map(s => s.name)
        }

        return {
            ruleBooks: this.journals.index,
            currentRule: this.currentRule,
            currentRulebook: this.currentRulebook,
            skillGroups: this.skillGroups,
            skills: this.skills,
            selections: this.selections,
            players: game.users.entities.filter(u => !u.isGM && u.character)
        }
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find(".set-data").click((event) => {
            const name = $(event.currentTarget).attr("data-name")
            const dtype = $(event.currentTarget).attr("data-dtype")
            this.selections[name] = (dtype === "Boolean") ? $(event.currentTarget).attr("data-val") !== "false" : $(event.currentTarget).attr("data-val")
            this.render()
        })

        html.find(".select-rule").click(async event => {
            this.currentRule = $(event.currentTarget).attr("data-rule-key")
            const journal = await this.journals.getDocument(this.currentRule)
            this.currentRulebook = await RuleBook.parseRuleBook(journal)
            this.render()
        })

        html.find("button").click(event => {
            const requestIndex = $(event.currentTarget).attr("data-request-index")
            const actionIndex = $(event.currentTarget).attr("data-action-index") || ""
            const talent = $(event.currentTarget).attr("data-talent")

            const players = []
            html.find("input:checked").each((j, entry) => {
                const prefix = `player-${actionIndex}-`
                if (!entry.name.startsWith(prefix)) return
                players.push(entry.name.substr(prefix.length))
            })

            let modifier = 0
            html.find("input,select").each((j, entry) => {
                const prefix = `modifier-${requestIndex}`
                if (entry.name !== prefix) return
                modifier += parseInt(entry.value) || 0
            })

            const whisper = []
            for (let userId of players) {
                whisper.push(game.users.entities.find(u => u._id === userId))
            }

            const mod = modifier < 0 ? ` ${modifier}` : (modifier > 0 ? ` +${modifier}` : "")
            let content = `<a class="roll-button request-roll" data-type="skill" data-modifier="${modifier}" data-name="${talent}"><i class="fas fa-dice"></i> ${talent}${mod}</a>`
            ChatMessage.create({content, whisper});
        })
    }

}
