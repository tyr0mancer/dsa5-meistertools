import {moduleName} from "../dsa5-meistertools.js";

export function registerSettings() {

    game.settings.registerMenu(moduleName, "manage-scenes", {
        name: "DSA5 Meistertools",
        label: "Einstellungen",
        hint: "Alle Einstellungen der Meistertools",
        icon: "fas fa-eye",
        type: MeistertoolsConfig,
        restricted: true
    });

    game.settings.register(moduleName, "settings", {
        name: "Settings",
        scope: "world",
        config: false,
        default: MeistertoolsConfig.DEFAULT_SETTINGS(),
        type: Object
    });

}


class MeistertoolsConfig extends FormApplication {

    static DEFAULT_SETTINGS() {
        return {
            scenes: {
                activateDefault: true,
                updatePlaylist: false,
                defaultPlaylist: '',
                filterExisting: false,
                categories: []
            }
        }
    }

    constructor(object, options) {
        super(object, options);
        game.settings.sheet.close();

        const packnameList = game.packs
            .filter(p => p.metadata.entity === 'Scene')
            .map(p => p.metadata.package + '.' + p.metadata.name)


        console.clear()
        console.log(packnameList)
        this.dataObject = mergeObject({
            packnameList: packnameList,
            playlists: game.playlists
        }, game.settings.get(moduleName, 'settings') || MeistertoolsConfig.DEFAULT_SETTINGS());
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = moduleName + '-config';
        options.title = 'DSA5 Meistertools Einstellungen';
        options.template = `modules/${moduleName}/templates/meistertools-config.html`;
        options.tabs = [{navSelector: ".tabs", contentSelector: ".content", initial: "scenes"}]
        options.closeOnSubmit = true;
        options.width = 400
        options.resizable = true
        return options;
    }

    getData() {
        return this.dataObject
    }

    render(force, context = {}) {
        return super.render(force, context);
    }


    activateListeners(html) {
        super.activateListeners(html);
        html.find('.add-scene-pack').click(ev => {
            ev.preventDefault();
            if (this.dataObject.scenes.categories === undefined)
                this.dataObject.scenes.categories = []
            this.dataObject.scenes.categories.push({
                name: '',
                folder: '',
                packname: '',
                keywords: ''
            })
            this.render()
        });

        html.find('.delete-scene-pack').click(ev => {
            ev.preventDefault();
            this.dataObject.scenes.categories.splice(ev.target.value, 1);
            this.render();
        });
    }

    _updateObject(event, formData) {
        let newDataObject = game.settings.get(moduleName, 'settings')
        newDataObject.scenes = {
            activateDefault: formData.activateDefault,
            filterExisting: formData.filterExisting,
            updatePlaylist: formData.activateDefault,
            defaultPlaylist: formData.defaultPlaylist,
            categories: []
        }
        console.log(formData)
        console.log(newDataObject)
        if (Array.isArray(formData.scenecategory_packname)) {
            let index
            for (index = 0; index < formData.scenecategory_packname.length; index++) {
                newDataObject.scenes.categories.push({
                    name: formData.scenecategory_name[index],
                    folder: formData.scenecategory_folder[index],
                    packname: formData.scenecategory_packname[index],
                    keywords: formData.scenecategory_keywords[index]
                })
            }
        } else {
            if (formData.scenecategory_packname)
                newDataObject.scenes.categories = [{
                    name: formData.scenecategory_name,
                    folder: formData.scenecategory_folder,
                    packname: formData.scenecategory_packname,
                    keywords: formData.scenecategory_keywords
                }]
        }
        game.settings.set(moduleName, 'settings', newDataObject);
    }
}

