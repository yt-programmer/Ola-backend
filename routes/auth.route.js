const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");

const {
  login,
  changeCredentials,
  me,
  logout,
} = require("../controllers/auth.controller");

const verifyToken = require("../middlewares/verifyToken");
const validationResultMiddleware = require("../middlewares/validationResultMiddleware");

const router = express.Router();

// =========================
// Login Rate Limit
// =========================

const limiterLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many login attempts from this IP, please try again later.",
});

// =========================
// Login
// =========================

router.post(
  "/login",

  limiterLogin,
  [
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ max: 10 })
      .withMessage("Username must not exceed 10 characters"),

    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validationResultMiddleware,
  login,
);

// =========================
// Change Credentials
// =========================

router.patch(
  "/credentials",
  verifyToken,
  [
    body("currentPassword")
      .trim()
      .notEmpty()
      .withMessage("Current password is required"),

    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ max: 10 })
      .withMessage("Username must not exceed 10 characters"),

    body("newPassword")
      .trim()
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  validationResultMiddleware,
  changeCredentials,
);

router.post("/logout", verifyToken, logout);
router.get("/me", verifyToken, me);

module.exports = router;
