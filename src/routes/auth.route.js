const express = require("express");
const passport = require("passport");
const authController = require("../controller/auth.controller");

const router = express.Router();

router.get(
    "/google", authController.googleAuth
);

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    authController.googleCallback
);

// Current user
router.get("/me",authController.userLoginWithCode);

// Logout
router.get("/logout",authController.userLogout);

// login with email or mobile
router.post("/login",authController.loginWithMobileOrEmail)

router.post("/verify-otp",authController.verifyOtp)

module.exports = router
