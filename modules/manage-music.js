import {moduleName} from "../dsa5-meistertools.js";


export default class ManageMusic extends Application {

    constructor() {
        super();
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = `Jukebox`;
        options.id = `${moduleName}.manage-travels`;
        options.template = `modules/${moduleName}/templates/manage-music.html`;
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
        html.find('button[name=start-playlist]').click(event => this._startPlaylist(event));
    }

    async getData() {
        return {
            playlists: game.playlists
        }
    }

    async _startPlaylist(event) {
        const playlistId = $(event.currentTarget).attr("data-playlist-id")
        await game.playlists.forEach(playlist => {
            if ((playlist._id) === playlistId)
                playlist.playAll()
            else if (playlist.playing)
                playlist.stopAll()
        })
        this.render()
    }
}

