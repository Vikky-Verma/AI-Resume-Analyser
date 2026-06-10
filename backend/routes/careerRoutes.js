const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const { getCareerAdvice, matchJob } = require("../controllers/careerController");

// Phase 6A - Career Recommendation
router.get("/:resumeId", authenticate, getCareerAdvice);

// Phase 6B - Job Description Matching
router.post("/match/:resumeId", authenticate, matchJob);

module.exports = router;