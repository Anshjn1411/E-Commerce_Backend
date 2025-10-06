const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller.js");
const authenticate = require("../middleware/authenticat.js");

router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.post("/register", authController.register);
router.post("/refresh-token", authController.refreshAccessToken);
router.post("/logout", authenticate, authController.logout);

module.exports = router;