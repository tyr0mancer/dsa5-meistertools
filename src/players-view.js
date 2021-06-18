import {moduleName} from "../meistertools.js";
import {MeistertoolsLocator} from "./locator.js";
import DSA5 from "../../../systems/dsa5/modules/system/config-dsa5.js";


export class PlayersView extends Application {
    isOpen = false

    toggle() {
        if (this.isOpen)
            this.close()
        else
            this.render(true)
    }

    close() {
        this.isOpen = false
        super.close()
    }

    render(force) {
        this.isOpen = true
        super.render(force)
    }

    constructor() {
        super();
        this.user = game.user
        Hooks.on(moduleName + ".update-location", (newLocation) => {
            this.render()
        });
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['meistertools'],
            top: 70,
            left: 120,
            width: 800,
            height: 420,
            resizable: true,
            template: `modules/${moduleName}/templates/players-view.hbs`,
            id: 'meistertools.players-view',
            title: 'DSA MeisterTools',
            //tabs: [{navSelector: ".tabs", contentSelector: ".content", initial: "initial"}]
        });
    }

    async getData() {
        /*
            const dateTime = game.settings.get('calendar-weather', 'dateTime')
            const dateString = `${dateTime.currentWeekday}, ${dateTime.day + 1}. ${dateTime.months[dateTime.currentMonth].name} - ${dateTime.timeDisp.substr(0, 5)}`
        */

        return {
            equipment: this.user.character?.items?.filter(i => i.type === "equipment"),
            user: this.user,
            isGM: game.user.isGM,
            currentLocation: MeistertoolsLocator.currentLocation,
            players: game.users.entities
        }
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find("a.message-user").click(event => {
            const recipient = $(event.currentTarget).attr("data-recipient")
            new Dialog({
                title: 'Geheime Nachricht versenden',
                content: `<label>Deine geheime Nachricht an <b>${recipient}</b>:</label><textarea name='message'></textarea>`,
                buttons: {
                    yes: {
                        icon: "<i class='fas fa-check'></i>",
                        label: `Senden`,
                        callback: html => {
                            const message = html.find('textarea[name=\'message\']').val();
                            if (message)
                                ChatMessage.create({
                                    user: game.user._id,
                                    content: 'Flüstert <i><b>"' + message + '"</b></i>',
                                    whisper: ChatMessage.getWhisperRecipients(recipient)
                                });
                        }
                    }
                },
                default: 'yes',
                render: html => {
                    html.find('textarea[name=\'message\']').focus()
                }
            }).render(true);
        })



        html.find("a.select-user").click(event => {
            const userId = $(event.currentTarget).attr("data-user-id")
            this.user = game.users.entities.find(e => e._id === userId)
            this.render()
        })


        html.find("button[name=open-library]").click(ev => {
            game.dsa5.itemLibrary.render(true)
        })

        html.find("button[name=open-wizzard]").click(ev => {
            game.dsa5.apps.journalBrowser.render(true)
        })



        html.find("button[name=find-token]").click(ev => {
            const token = game.scenes.viewed.data.tokens.find(t => t._actor.id === this.user?.character?._id)
            if (token) {
                canvas.pan(token.data)
                canvas.tokens.activate()
                this.close()
            } else {
                ui.notifications.warn(`In dieser Szene ist keine Figur, die ${this.user?.name} kontrollieren kann.`);
            }
        })


        html.find("button.open-app").click(event => {
            const myApp = game[event.currentTarget.name].apps[0]
            myApp.renderPopout(true)
        })


        html.find("button[name=open-sheet]").click(ev => {
            if (!this.user?.character) return
            this.user.character.sheet.render(true)
            //this.user.character.sheet.renderPopout(true)
        })

        html.find(".box.header.biome").click(ev => {
            this.render(true)
        })


    }

}
