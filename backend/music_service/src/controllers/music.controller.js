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

const getSongById = async (req, res) => {
    try {
        const { id } = req.params;
        const song = await musicModel.findById(id);
        if (!song) {
            return res.status(404).json({ message: 'Song not found' });
        }
        res.status(200).json(song);
    } catch (error) {
        console.error('Error fetching song by id:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const addSong = async (req, res) => {
    try {
        const { title, artist } = req.body;
        const music = req.files.music ? req.files.music?.[0] : null;
        const cover = req.files.cover ? req.files.cover?.[0] : null;
        const user = req.user;

        if (!title || !artist || !music) {
            return res.status(400).json({ message: 'Title, artist, and music file are required' });
        }

        const music_base64Image = req.files.music[0].buffer.toString("base64");

        const musicUrl = await uploadService.uploadFile(music_base64Image, music.originalname);

        let coverUrl = '';
        if (cover) {
            const cover_base64Image = req.files.cover[0].buffer.toString("base64");
            coverUrl = await uploadService.uploadFile(cover_base64Image, cover.originalname);
        }
        const newSong = new musicModel({
            title,
            artist,
            artistId: user.id,
            musicId: musicUrl.fileId,
            coverId: coverUrl.fileId,
            musicUrl: musicUrl.url,
            coverUrl: coverUrl.url,
        });
        await newSong.save();
        res.status(201).json(newSong);
    } catch (error) {
        console.error('Error adding song:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const updateSong = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, artist } = req.body;
        const music = req.files.music ? req.files.music?.[0] : null;
        const cover = req.files.cover ? req.files.cover?.[0] : null;
        const user = req.user;
        const song = await musicModel.findById(id);

        if (!song) {
            return res.status(404).json({ message: 'Song not found' });
        }
        if (song.artistId.toString() !== user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (title) song.title = title;
        if (artist) song.artist = artist;

        if (music) {
            await uploadService.deleteFile(song.musicId);
            const music_base64Image = req.files.music[0].buffer.toString("base64");
            const musicUrl = await uploadService.uploadFile(music_base64Image, music.originalname);
            song.musicUrl = musicUrl.url;
            song.musicId = musicUrl.fileId;
        }

        if (cover) {
            await uploadService.deleteFile(song.coverId);
            const cover_base64Image = req.files.cover[0].buffer.toString("base64");
            const coverUrl = await uploadService.uploadFile(cover_base64Image, cover.originalname);
            song.coverUrl = coverUrl.url;
            song.coverId = coverUrl.fileId;
        }

        await song.save();
        res.status(200).json(song);
    } catch (error) {
        console.error('Error updating song:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const deleteSong = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const song = await musicModel.findById(id);
        if (!song) {
            return res.status(404).json({ message: 'Song not found' });
        }
        if (song.artistId.toString() !== user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        await musicModel.findByIdAndDelete(id);
        await uploadService.deleteFile(song.musicId);
        await uploadService.deleteFile(song.coverId);

        res.status(200).json({ message: 'Song deleted successfully' });
    } catch (error) {
        console.error('Error deleting song:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


module.exports = {
    getAllSongs,
    getSongById,
    addSong,
    updateSong,
    deleteSong,
}