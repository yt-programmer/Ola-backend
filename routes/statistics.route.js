const express = require("express");

const { getStatistics } = require("../controllers/statistics.controller");

const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();

router.use(verifyToken);

router.get("/", getStatistics);

module.exports = router;
