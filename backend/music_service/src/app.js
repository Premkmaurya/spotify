const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const musicRoutes = require('./routes/music.routes');
const playlistRoutes = require("./routes/playlist.routes");

const app = express();

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://spotify-ebon-one.vercel.app'],
  credentials: true,
}));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'music-service'
  });
});

app.use('/api/music', musicRoutes);
app.use('/api/playlist', playlistRoutes);

module.exports = app;