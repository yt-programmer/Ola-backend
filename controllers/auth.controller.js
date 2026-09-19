const bcrypt = require("bcryptjs");

const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const httpStatus = require("../utils/httpStatus");
const AppError = require("../utils/appError");
const asyncWrapper = require("../middlewares/asyncWrapper");

// =========================
// Login
// =========================

const login = asyncWrapper(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(
      new AppError("Username and password are required", 400, httpStatus.FAIL),
    );
  }

  const user = await User.findOne({
    username: username.trim(),
  });

  if (!user) {
    return next(
      new AppError("Invalid username or password", 401, httpStatus.FAIL),
    );
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return next(
      new AppError("Invalid username or password", 401, httpStatus.FAIL),
    );
  }

  const token = generateToken(user);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 24 * 60 * 60 * 1000,
  };

  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    status: httpStatus.SUCCESS,
    user: {
      id: user._id,
      username: user.username,
    },
  });
});

// =========================
// Change Username + Password
// =========================

const changeCredentials = asyncWrapper(async (req, res, next) => {
  const { currentPassword, username, newPassword } = req.body;

  const newUsername = username.trim();

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404, httpStatus.FAIL));
  }

  const passwordMatch = await bcrypt.compare(currentPassword, user.password);

  if (!passwordMatch) {
    return next(
      new AppError("Current password is incorrect", 401, httpStatus.FAIL),
    );
  }

  const existingUser = await User.findOne({
    username: newUsername,
    _id: { $ne: user._id },
  });

  if (existingUser) {
    return next(
      new AppError("Username is already taken", 400, httpStatus.FAIL),
    );
  }

  user.username = newUsername;

  user.password = await bcrypt.hash(newPassword, 12);

  await user.save();

  const token = generateToken(user);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 24 * 60 * 60 * 1000,
  };

  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    status: httpStatus.SUCCESS,
    message: "Username and password changed successfully",
    user: {
      id: user._id,
      username: user.username,
    },
  });
});

const logout = asyncWrapper(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });

  res.json({ status: httpStatus.SUCCESS, message: "Logged out successfully" });
});

const me = asyncWrapper((req, res) => {
  res.json({ status: httpStatus.SUCCESS, user: req.user });
});
// =========================
// Exports
// =========================

module.exports = {
  login,
  changeCredentials,
  logout,
  me,
};
