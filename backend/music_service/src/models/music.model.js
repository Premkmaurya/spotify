const mongoose = require('mongoose');


const musicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    artist: {
        type: String,
        required: true,
    },
    artistId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    musicUrl: {
        type: String,
        required: true,
    },
    coverUrl: {
        type: String,
    },
}, { timestamps: true });


const musicModel = mongoose.model('music', musicSchema);

module.exports = musicModel;