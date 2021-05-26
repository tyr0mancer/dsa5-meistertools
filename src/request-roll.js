import {moduleName} from "../meistertools.js";
import {RULE_CATEGORIES, RULES} from "../config/request-roll.config.js";


export class RequestRoll extends Application {
    constructor() {
        super();
        this.rules = RULES
        this.ruleCategories = RULE_CATEGORIES
        this.content = ""
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['meistertools'],
            top: 50,
            left: 100,
            width: 800,
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
            this.render()
        })

        html.find("button.request-roll").click(event => {

        })


    }

}
