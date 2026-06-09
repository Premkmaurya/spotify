const musicModel = require('../models/music.model');
const uploadService = require('../services/storage.service');


const getAllSongs = async (req, res) => {
    try {
        const songs = await musicModel.find();
        res.status(200).json(songs);
    } catch (error) {
        console.error('Error fetching songs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const addSong = async (req, res) => {
    try {
        const { title, artist } = req.body;
        const music = req.files['music'] ? req.files['music'][0] : null;
        const cover = req.files['cover'] ? req.files['cover'][0] : null;
        const user = req.user;

        if (!title || !artist || !music) {
            return res.status(400).json({ message: 'Title, artist, and music file are required' });
        }
        const musicUrl = await uploadService.uploadFile(music);
        let coverUrl = '';
        if (cover) {
            coverUrl = await uploadService.uploadFile(cover);
        }
        const newSong = new musicModel({
            title,
            artist,
            artistId: user.id,
            musicUrl,
            coverUrl,
        });
        await newSong.save();
        res.status(201).json(newSong);
    } catch (error) {
        console.error('Error adding song:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    getAllSongs,
    addSong,
}