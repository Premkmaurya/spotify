const express = require('express');
const musicController = require('../controllers/music.controller');
const authValidate = require('../middlewares/auth.validate');
const multer = require('multer');

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });


router.get('/', authValidate.userValidate, musicController.getAllSongs)

router.get('/:id', authValidate.userValidate, musicController.getSongById)

router.post('/add', authValidate.artistValidate, upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "music", maxCount: 1 },
]), musicController.addSong)

router.patch('/update/:id', authValidate.artistValidate, upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "music", maxCount: 1 },
]), musicController.updateSong)

router.delete('/delete/:id', authValidate.artistValidate, musicController.deleteSong)




module.exports = router;