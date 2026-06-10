const express = require('express');
const cookieParser = require('cookie-parser');


const musicRoutes = require('./routes/music.routes');
const playlistRoutes = require("./routes/playlist.routes");

const app = express();


app.use(express.json());
app.use(cookieParser());

app.use('/api/music', musicRoutes);
app.use('/api/playlist', playlistRoutes);

module.exports = app;