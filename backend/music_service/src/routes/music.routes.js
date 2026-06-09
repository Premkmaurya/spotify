const express = require('express');
const musicController = require('../controllers/music.controller');
const authValidate = require('../middlewares/auth.validate');

const router = express.Router();    


router.get('/',authValidate, musicController.getAllSongs)

router.post('/add',authValidate, musicController.addSong)




module.exports = router;