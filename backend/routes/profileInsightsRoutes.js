const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const { analyzeProfileInsights } = require("../controllers/profileInsightsController");

router.post("/:resumeId", authenticate, analyzeProfileInsights);

module.exports = router;