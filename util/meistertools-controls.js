import {moduleName} from "../meistertools.js";

/**
 * MeisterTools Controls
 */
export default class MeistertoolsControls {

    constructor() {
    }

    /**
     * Add MeisterTools control panel to the menu
     */
    static async registerControls(controls, html) {
        const playerBtn = $(`<li class="scene-control player-view" data-tool="players-view" title="${game.i18n.localize("Meistertools.PlayerView")}"><i class="fas fa-dsa5"></i></li>`);
        html.append(playerBtn);

        const {topMenu} = game.settings.get(moduleName, 'general')
        const meisterBtn = $(`<li class="scene-control meistertools" data-control="meistertools" title="${game.i18n.localize("Meistertools.AppName")}">&nbsp;</li>`);
        meisterBtn[0].addEventListener('click', ev => this.toggleMeisterMenu(ev, html));
        if (topMenu)
            html.prepend(meisterBtn);
        else
            html.append(meisterBtn);
        const meisterOptions = $(`<li class="scene-control meistertools menu"><div id="meistertoolsOptions"><ol class="control-tools">${await this._getMenuEntry()}</ol></div></li>`);
        //html.append(playerBtn);
        html.append(meisterOptions);
        html.find('#meistertoolsOptions li.control-tool').click(ev => this._openApp(ev, html))

        html.find('li.scene-control.player-view').click(ev => this._openApp(ev, html))


    }


    /**
     * Toggle MeisterTools control panel visibility
     */
    static async toggleMeisterMenu(event, html) {
        // hide MeisterTools control panel
        if (html.find('.scene-control.meistertools').hasClass('active')) {
            html.find('.scene-control.meistertools').removeClass('active');
            html.find('.scene-control.active-layer').first().addClass('active');
            html.find('.scene-control').removeClass('active-layer');
            html.find('#meistertoolsOptions').hide();
            $(document.getElementById("controls")).css('z-index', '');
        }
        // display MeisterTools control panel
        else {
            html.find('.scene-control').removeClass('active-layer');
            html.find('.scene-control.active').addClass('active-layer');
            html.find('.scene-control').removeClass('active');
            html.find('.scene-control.meistertools').addClass('active');
            html.find('#meistertoolsOptions').show();
            $(document.getElementById("controls")).css('z-index', 159);
        }
        if (event) event.stopPropagation();
    }


    /**
     * Get control options
     */
    static async _getMenuEntry() {
        let result = ``
        for (const m of game.meistertools?.modules) {
            if (!m.showEntry) continue
            if (game.meistertools.applications[m.key] && game.meistertools.applications[m.key].isOpen === true) {
                result += `<li class="control-tool active ${m.key}" title="${m.name}" data-tool="${m.key}">
                <i class="${m.icon}"></i>
            </li>`
            } else {
                result += `<li class="control-tool ${m.key}" title="${m.name}" data-tool="${m.key}">
                <i class="${m.icon}"></i>
            </li>`
            }
        }
        return result
    }


    /**
     * Creates new instance of module class if not existing and toggles visibility
     */
    static _openApp(event, html) {
        const moduleKey = $(event.currentTarget).attr("data-tool")
        if (moduleKey) {
            let isB = false
            if (game.meistertools.applications[moduleKey] === undefined) {
                $(event.currentTarget).addClass('active')
                const {class: MeisterModule, isButton} = game.meistertools.modules.find(m => m.key === moduleKey)
                game.meistertools.applications[moduleKey] = new MeisterModule()
                isB = isButton
            }
            if (isB) return;

            if (game.meistertools.applications[moduleKey].isOpen)
                $(event.currentTarget).removeClass('active')
            else
                $(event.currentTarget).addClass('active')

            game.meistertools.applications[moduleKey].toggle()
        }
    }
};
