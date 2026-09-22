const express = require("express");
const router = express.Router();
const authController = require("../auth/auth.controller");
const google = require("../config/passport");
const { body } = require("express-validator");
const validate = require("../middlewares/validation.middleware");
const {
  authenticate,
  sendJWT,
  generateJWT,
} = require("../middlewares/auth.middleware");
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// untuk register
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name must be filled in"),
    body("email").isEmail().withMessage("Invalid Email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  authController.register
);

// untuk login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password must be filled in"),
  ],
  validate,
  authController.login
);

// OTP Verification
router.post(
  "/verifyOtp",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits"),
  ],
  validate,
  authController.verifyOTP
);

router.post(
  "/forgotPassword",
  [body("email").isEmail().withMessage("Invalid email")],
  validate,
  authController.forgotPassword
);

router.post(
  "/resetPassword",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  validate,
  authController.resetPassword
);

// Send New OTP
router.post(
  "/sendnewOTP",
  [body("email").isEmail().withMessage("Invalid email")],
  validate,
  authController.sendNewOtp
);

router.post("/logout", [authenticate], authController.logout);

router.get(
  "/google",
  google.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/drive.metadata",
    ],
    accessType: "offline", // harus di sini
    prompt: "consent",
  })
); // harus di sini  }));

router.get(
  "/google/callback",
  google.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  authController.callback
);

router.get("/me", [authenticate], authController.getTokenData);

module.exports = router;
