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
    musicId: {
        type: String,
        required: true,
    },
    musicUrl: {
        type: String,
        required: true,
    },
    coverId: {
        type: String,
        required: true,
    },
    coverUrl: {
        type: String,
        required: true,
    },
}, { timestamps: true });


const musicModel = mongoose.model('music', musicSchema);

module.exports = musicModel;