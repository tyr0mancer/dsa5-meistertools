import {moduleName} from "../meistertools.js";

export async function manageTravels() {
    const app = new ManageTravels()
    app.render(true)
}


class ManageTravels extends Application {

    constructor() {
        super();
        this.observableData = {
            foo: 'bar',
            checkbox: true,
            radiobutton: 'test1',
            myObject: {
                foo: 'barbar'
            },
            sections: [
                {
                    name: 'Klaus',
                    options: ['Klaus', 'Peter'],
                },
                {
                    name: 'Dieter',
                    options: ['Dieter', 'Rich'],
                }
            ]
        }
        const moduleSettings = game.settings.get(moduleName, 'settings')
        this.settings = moduleSettings.nsc

        this.packs = [
            {
                key: 'professions',
                entityType: 'Actor',
                packNames: [this.settings.professionPack]
            }
        ]
        console.log(this.packs)


        const entityType = 'Actor'
        const packNames = [this.settings.professionPack]
        this.packList = game.packs.filter(p => (p.metadata.entity === entityType && packNames.includes(p.metadata.package + '.' + p.metadata.name)))
        this.packListIndexed = false
    }


    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = `Auf Reisen`;
        options.id = `${moduleName}.manage-travels`;
        options.template = `modules/${moduleName}/templates/manage-travels.html`;
        options.tabs = [{navSelector: ".tabs", contentSelector: ".content", initial: "scene-0"}]
        options.resizable = true;
        options.top = 80;
        options.left = 100;
        options.width = 300;
        options.height = 800;
        return options;
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find("input[type='checkbox']").change(event => this._handleCheckboxChange(event, html));
        html.find("input[type='text']").change(event => this._handleInputChange(event, html));
        html.find("input[type='radio']").change(event => this._handleInputChange(event, html));
    }

    async getData() {
        // get index array from scene packs if not done already
        if (!this.packListIndexed) {
            console.log('indexing packs')
            for (let pack of this.packList)
                await pack.getIndex()
            this.packListIndexed = true
        }

        let packLists = {
            professions: []
        }
        for (let pack of this.packList)
            packLists[pack.metadata.name] = pack.index

        console.log(this.packList)
        console.log(packLists)

        return {
            packLists,
            data: this.observableData,
            settings: this.settings
        }
    }

    static get DEFAULT_SETTINGS() {
        return {
            bar: 'foo'
        }
    }


    _handleInputChange(event, html) {
        this._updateDate(event.target.name, event.target.value)
    }

    _handleCheckboxChange(event, html) {
        this._updateDate(event.target.name, event.target.checked)
    }

    _updateDate(varName, varValue) {
        let path = varName.split(".");
        let fieldName = path.splice(path.length - 1, 1);
        let objField = path.reduce((r, u) => r && r[u] ? r[u] : '', this.observableData);
        objField[fieldName] = varValue;
        this.render()
    }


}

