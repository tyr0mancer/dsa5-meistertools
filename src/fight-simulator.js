import {moduleName} from "../meistertools.js";

export class FightSimulator extends Application {
    constructor() {
        super();
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['meistertools'],
            top: 50,
            left: 100,
            width: 800,
            height: 650,
            resizable: true,
            template: `modules/${moduleName}/templates/fight-simulator.hbs`,
            id: 'meistertools.fight-simulator',
            title: 'Fight Simulator',
        });
    }

    async getData() {
        return {}
    }

    activateListeners(html) {
        super.activateListeners(html);
    }

}


/*
                <!--
                {{#each goodguys as |actor id|}}
                    {{#with actor}}
                        <div class="inner box">
                            <input {{checked settings.closeAfterGeneration}}
                                    id="is-active-{{_id}}" name="is-active-{{_id}}"
                                    type="checkbox"/>
                            <label for="is-active-{{_id}}">{{name}}}</label>
                        </div>
                    {{/with}}
                {{/each}}
                -->

 */
