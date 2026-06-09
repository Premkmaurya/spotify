const mongoose = require('mongoose');


const musicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
    },
    artistId: {
        type: String,
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