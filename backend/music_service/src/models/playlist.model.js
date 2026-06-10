const mongoose = require("mongoose");


const playlistSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    artist: {
        type: String,
        required: true,
    },
    musics: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "music",
        validate: {
            validator: (value) => mongoose.Types.ObjectId.isValid(value),
            message: 'musics must contain valid ObjectIds',
        },
    }],
    artistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        validate: {
            validator: mongoose.Types.ObjectId.isValid,
            message: 'artistId must be a valid ObjectId',
        },
    }
}, { timestamps: true });

const playlistModel = mongoose.model("playlist", playlistSchema);

module.exports = playlistModel;