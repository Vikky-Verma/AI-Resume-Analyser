const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const { analyzeProjectIntelligence } = require("../controllers/projectController");

router.post("/:resumeId", authenticate, analyzeProjectIntelligence);

module.exports = router;