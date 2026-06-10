const express = require("express");

const router = express.Router();

const authenticate =
  require("../middleware/authMiddleware");

const {
  createAnalysis,
} = require(
  "../controllers/analysisController"
);

router.post(
  "/:resumeId",
  authenticate,
  createAnalysis
);

module.exports = router;