import {moduleName} from "../meistertools.js";
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
        });
    }

    async getData() {
        //this.regeln = await this.journals.getContent() || []
/*
        for (const regel of this.regeln) {
            const journal = $(regel.data.content);
            console.log(journal)
            const x = $('tbody', journal)
            console.log(x)
            //console.log(regel.data.content)
        }
*/

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
    }

}
