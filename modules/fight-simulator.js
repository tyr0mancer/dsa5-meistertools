import mstrtls from "../config/meistertools-config.js"
import {MeisterApplication} from "../util/meister-application.js";

export class FightSimulator extends MeisterApplication {

    static get meisterModule() {
        return {name: "FightSimulator", icon: "fas fa-user-friends", key: "fight-simulator", class: FightSimulator}
    }

    constructor(moduleKey = FightSimulator.meisterModule.key) {
        super(moduleKey);
        this.journals = game.packs.get(mstrtls.moduleName + ".journal-regeln")
    }

    close() {
        this.audio?.pause()
        super.close()
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['meistertools'],
            width: 740,
            height: 650,
            resizable: true,
            template: `modules/${mstrtls.moduleName}/templates/fight-simulator.hbs`,
            id: 'meistertools.fight-simulator',
            title: 'Kampf simulieren',
        });
    }

    async getData() {
        this.regeln = await this.journals.getContent()
        for (const regel of this.regeln) {
            const journal = $(regel.data.content);
            console.log(journal)
            const x = $('tbody', journal)
            console.log(x)
            //console.log(regel.data.content)
        }


        return {regeln: this.regeln}
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find("button[name=fight]").click(async () => {
            this.audio = await AudioHelper.play({
                src: `modules/${mstrtls.moduleName}/assets/audio/digby.mp3`,
                volume: 0.8,
                loop: false
            }, false);
        })
    }

}
