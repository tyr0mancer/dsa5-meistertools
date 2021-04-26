import {moduleName} from "../meistertools.js";


export default class Jukebox extends Application {

    constructor() {
        super();
        this.activePlaylistIds = game.playlists.filter(p => p.playing).map(p => p._id)
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = `Jukebox`;
        options.id = `${moduleName}.jukebox`;
        options.template = `modules/${moduleName}/templates/jukebox.html`;
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
        html.find('button[name=skip-sound]').click(event => this._skipSound(event));
    }

    async getData() {
        const playlists = game.playlists.map(playlist => {
            return {
                _id: playlist._id,
                name: playlist.name,
                sounds: playlist.sounds,
                playing: this.activePlaylistIds.includes(playlist._id)
            }
        })

        return {playlists}
    }


    async _skipSound(event) {
        const playlistId = $(event.currentTarget).attr("data-playlist-id")
        this.activePlaylistIds = [playlistId]
        await game.playlists.forEach(playlist => playlist.stopAll())
        await game.playlists.find(playlist => playlist._id === playlistId).playAll()
        setTimeout(()=>{
            this.render()
        }, 1000)
    }

    async _startPlaylist(event) {
        const playlistId = $(event.currentTarget).attr("data-playlist-id")
        this.activePlaylistIds = [playlistId]
        await game.playlists.forEach(playlist => {
            if ((playlist._id) === playlistId)
                playlist.playAll()
            else if (playlist.playing)
                playlist.stopAll()
        })
        setTimeout(()=>{
            this.render()
        }, 1000)
    }
}
