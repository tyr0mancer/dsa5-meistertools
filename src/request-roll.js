import {moduleName} from "../meistertools.js";
import {RULE_CATEGORIES, RULES} from "../config/request-roll.config.js";


export class RequestRoll extends Application {
    constructor() {
        super();
        this.rules = RULES
        this.ruleCategories = RULE_CATEGORIES
        this.content = ""
        getTemplate(`modules/${moduleName}/templates/roll_nightwatch.hbs`);
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['meistertools'],
            top: 50,
            left: 100,
            width: 900,
            height: 650,
            resizable: true,
            template: `modules/${moduleName}/templates/request-roll.hbs`,
            id: 'meistertools.request-roll',
            title: 'Fokus Regeln',
        });
    }

    async getData() {
        return {
            options: {
                players: game.users.entities.filter(u => !u.isGM),
                rules: this.rules,
                ruleCategories: this.ruleCategories,
            },
            rule: this.rule,
        }
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find("a.set-rule").click(event => {
            const ruleKey = $(event.currentTarget).attr("data-rule-key")
            this.rule = RULES.find(r => r.key === ruleKey)
            this.content = ``
            this.render()
        })

        html.find("button.request-roll").click(event => {
            const n = $(event.currentTarget).attr("data-request")
            const request = this.rule.rollRequests[n]
            const userId = html.find(`input[name=target-${n}]:checked`).val()
            const whisper = [game.users.entities.find(u => u._id === userId)]
            const {talent, modifier} = request
            const mod = modifier < 0 ? ` ${modifier}` : (modifier > 0 ? ` +${modifier}` : "")
            let msg = `<a class="roll-button request-roll" data-type="skill" data-modifier="${modifier}" data-name="${talent}"><i class="fas fa-dice"></i> ${talent}${mod}</a>`
            ChatMessage.create({content: msg, whisper});
        })

    }

}

function nextStep(input, rule) {
    console.log(input)

    return `<pre>${JSON.stringify(rule)}</pre>`
}
