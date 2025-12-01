const express = require("express");
const router = express.Router();
const passport = require("../../config/passport");
const authController = require("../controller/authController");

// NORMAL AUTH
router.post("/register", authController.register);
router.post("/login", authController.login);

// FORGOT PASSWORD (gửi OTP)
router.post("/forgot-password", authController.forgotPassword);

// RESET PASSWORD bằng OTP
router.post("/reset-password", authController.resetPassword);

// GOOGLE LOGIN
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  authController.googleCallback
);

module.exports = router;
