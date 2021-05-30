import {moduleName} from "../meistertools.js";
import {RULE_CATEGORIES, RULES} from "../config/request-roll.config.js";
import {MeistertoolsUtil} from "../meistertools-util.js";


export class RequestRoll extends Application {
    constructor() {
        super();
        this.rules = RULES
        this.ruleCategories = RULE_CATEGORIES
        this.content = ""
        this.skillpack = game.packs.get("dsa5.skills")
        this.skills = []
        //getTemplate(`modules/${moduleName}/templates/roll_nightwatch.hbs`);
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
            title: 'Regelbuch (beta)',
        });
    }

    async getData() {
        if (!this.skills.length)
            this.skills = await this.skillpack.getContent()

        return {
            options: {
                players: game.users.entities.filter(u => !u.isGM),
                rules: this.rules,
                ruleCategories: this.ruleCategories,
            },
            skills: this.skills,
            rule: this.rule,
        }
    }

    activateListeners(html) {
        super.activateListeners(html);
        MeistertoolsUtil.addDefaultListeners(html);

        html.find(".talents").click(() => {
            this.rule = null
            this.render()
        })

        html.find("a.set-rule").click(event => {
            const ruleKey = $(event.currentTarget).attr("data-rule-key")
            this.rule = RULES.find(r => r.key === ruleKey)
            this.content = ``
            this.render()
        })

        html.find("button.request-roll").click(event => {
            const n = $(event.currentTarget).attr("data-request")
            const k = $(event.currentTarget).attr("data-roll")
            const request = this.rule.rollRequests[n]
            const userId = html.find(`input[name=target-${n}]:checked`).val()
            const whisper = [game.users.entities.find(u => u._id === userId)]
            const {talent, modifier, comment} = request.rolls[k]
            const mod = modifier < 0 ? ` ${modifier}` : (modifier > 0 ? ` +${modifier}` : "")
            let msg = `${comment} <a class="roll-button request-roll" data-type="skill" data-modifier="${modifier}" data-name="${talent}"><i class="fas fa-dice"></i> ${talent}${mod}</a>`
            ChatMessage.create({content: msg, whisper});
        })

        html.find("button.request-talent-check").click(event => {
            const talent = $(event.currentTarget).attr("data-talent")
            const modifier = 0
            const userIds = []
            html.find(`input.player`).each((i, e) => {
                if (e.checked)
                    userIds.push(e.name)
            })
            const whisper = game.users.entities.filter(u => userIds.includes(u._id))
            const mod = modifier < 0 ? ` ${modifier}` : (modifier > 0 ? ` +${modifier}` : "")
            let msg = `<a class="roll-button request-roll" data-type="skill" data-modifier="${modifier}" data-name="${talent}"><i class="fas fa-dice"></i> ${talent}${mod}</a>`
            ChatMessage.create({content: msg, whisper});
        })

    }

}
