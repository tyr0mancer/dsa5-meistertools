import {moduleName, Meistertools} from "../meistertools.js";

export class Jukebox extends Application {
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
        Meistertools.addDefaultListeners(html);
        html.find('button[name=start-playlist]').click(event => this._startPlaylist(event));
        html.find('a.skip-sound').click(event => this._skipSound(event));
        html.find('a.stop-music').click(() => this._stopMusic());
    }

    async _skipSound(event) {
        const playlistId = $(event.currentTarget).attr("data-playlist-id")
        this.activePlaylistIds = [playlistId]
        await game.playlists.forEach(playlist => playlist.stopAll())
        await game.playlists.find(playlist => playlist._id === playlistId).playAll()
        setTimeout(() => {
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
        setTimeout(() => {
            this.render()
        }, 1000)
    }

}
