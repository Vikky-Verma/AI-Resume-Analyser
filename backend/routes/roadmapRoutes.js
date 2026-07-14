const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const { analyzeRoadmap } = require("../controllers/roadmapController");

router.post("/:resumeId", authenticate, analyzeRoadmap);

module.exports = router;
