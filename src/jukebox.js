import {moduleName} from "../meistertools.js";
import {MeistertoolsUtil} from "../meistertools-util.js";

export class Jukebox extends Application {
    constructor() {
        super();
        this.activePlaylistIds = game.playlists.filter(p => p.playing).map(p => p._id)
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['meistertools'],
            top: 70,
            left: 120,
            width: 250,
            height: 650,
            resizable: true,
            template: `modules/${moduleName}/templates/jukebox.hbs`,
            id: 'meistertools.jukebox',
            title: 'Jukebox',
        });
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

    activateListeners(html) {
        super.activateListeners(html);
        MeistertoolsUtil.addDefaultListeners(html);
        html.find('button[name=start-playlist]').click(event => this._startPlaylist(event));
        html.find('a.skip-sound').click(event => this._skipSound(event));
        html.find('a.stop-music').click(() => this._stopMusic());
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

    _stopMusic() {
        game.playlists.forEach(playlist => playlist.stopAll())
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
