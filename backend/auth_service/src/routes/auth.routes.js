const express = require("express");

const router = express.Router();
const authController = require("../controllers/auth.controller");
const authValidate = require("../middlewares/auth.validate");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/getMe", authValidate, authController.getMe);

module.exports = router;
