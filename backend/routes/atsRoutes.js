const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const { analyzeATS } = require("../controllers/atsController");

// POST because we now send targetRole + experienceLevel in the body
router.post("/:resumeId", authenticate, analyzeATS);

module.exports = router;