require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const httpStatus = require("./utils/httpStatus");

const app = express();

const port = process.env.PORT || 5000;
const URL = process.env.MONGO_URL;

// =========================
// Security
// =========================

app.use(helmet());

app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  }),
);

// =========================
// Body & Cookies
// =========================

app.use(express.json());
app.use(cookieParser());

// =========================
// Rate Limit
// =========================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api", limiter);

// =========================
// Routes
// =========================

app.use("/api/auth", require("./routes/auth.route.js"));

app.use("/api/classes", require("./routes/class.route.js"));

app.use("/api/statistics", require("./routes/statistics.route.js"));

// =========================
// 404
// =========================

app.use((req, res) => {
  res.status(404).json({
    status: httpStatus.FAIL,
    message: "Route not found",
    code: 404,
  });
});

// =========================
// Global Error Handler
// =========================

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  res.status(err.statusCode || 500).json({
    status: err.statusText || httpStatus.ERROR,
    message: err.message || "Something went wrong",
    code: err.statusCode || 500,
  });
});

// =========================
// Database
// =========================

mongoose
  .connect(URL)
  .then(() => {
    console.log("DB connected successfully");

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Error DB =>", err);
    process.exit(1);
  });
