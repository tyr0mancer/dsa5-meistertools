import {moduleName} from "../meistertools.js";

/**
 * remembers playlist Name in flags and assigns new playlist in case the old playlist was removed
 * and replaced with a playlist with the same name
 */
export function updatePlaylist(scene, data) {
    if (!game.user.isGM)
        return;

    const {updatePlaylist, defaultPlaylist} = game.settings.get(moduleName, 'scenes')
    if (!updatePlaylist) return

    if (hasProperty(data, 'active')) {
        if (!scene.playlist) {
            let playlistName = scene.getFlag(moduleName, 'playlistName')
            if (!playlistName && defaultPlaylist !== '') {
                playlistName = defaultPlaylist
            }

            if (playlistName) {
                console.log(moduleName + ' :: scene playlist not found, was named ', playlistName)
                const playlist = game.playlists.find(p => p.name === playlistName)
                if (playlist)
                    scene.update({playlist: playlist.data._id})
            }
        }
    }

    if (hasProperty(data, 'playlist')) {
        const playlistName = scene.playlist?.data?.name
        if (playlistName) {
            console.log(moduleName + ' :: playlist was updated, setFlag() ', playlistName)
            scene.setFlag(moduleName, 'playlistName', playlistName)
        } else {
            console.log(moduleName + ' :: playlist was deleted, unsetFlag() ')
            scene.unsetFlag(moduleName, 'playlistName')
        }
    }
}
