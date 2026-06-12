const playlistModel = require('../models/playlist.model');

const createPlaylist = async (req, res) => {
    try {
        const { name, artist, musics } = req.body;
        const user = req.user;
        const newPlaylist = new playlistModel({
            name,
            artist,
            musics,
            artistId: user.id,
        });

        const savedPlaylist = await newPlaylist.save();
        res.status(201).json(savedPlaylist);
    } catch (error) {
        return res.status(500).json({ message: 'Error creating playlist', error: error.message });
    }
};

const getPlaylists = async (req, res) => {
    try {
        const playlists = await playlistModel.find().populate('musics');
        return res.status(200).json(playlists);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching playlists', error: error.message });
    }
};

const getPlaylist = async (req, res) => {
    try {
        const { id } = req.params;

        const playlist = await playlistModel.findById(id).populate("musics");
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        return res.status(200).json(playlist);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching playlist', error: error.message });
    }
};

const deletePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const playlist = await playlistModel.findById(id);
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        // Check if the user is the creator of the playlist
        if (playlist.artistId.toString() !== user.id) {
            return res.status(403).json({ message: 'Unauthorized: Only the creator can delete this playlist' });
        }

        await playlistModel.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Playlist deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting playlist', error: error.message });
    }
};

module.exports = {
    createPlaylist,
    getPlaylists,
    getPlaylist,
    deletePlaylist,
};