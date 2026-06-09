const musicModel = require('../models/music.model');

const getAllSongs = async (req, res) => {
    try {
        const songs = await musicModel.find();
        res.status(200).json(songs);
    } catch (error) {
        console.error('Error fetching songs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


module.exports = {
    getAllSongs,
}