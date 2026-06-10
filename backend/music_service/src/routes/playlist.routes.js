const express = require('express');
const playlistController = require('../controllers/playlist.controller');
const authValidate = require('../middlewares/auth.validate');

const router = express.Router();

router.post('/create', authValidate.artistValidate, playlistController.createPlaylist);

router.get('/', authValidate.userValidate, playlistController.getPlaylists);

router.get('/:id', authValidate.userValidate, playlistController.getPlaylist);

module.exports = router;