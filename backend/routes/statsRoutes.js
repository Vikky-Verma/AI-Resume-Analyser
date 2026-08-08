const express = require("express");

const router = express.Router();

const { getPublicStats, recordVisit } = require("../controllers/statsController");

router.get("/public", getPublicStats);
router.post("/visit", recordVisit);

module.exports = router;