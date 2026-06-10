const express = require("express");

const router = express.Router();

const authenticate =
  require("../middleware/authMiddleware");

const {
  analyzeATS,
} = require("../controllers/atsController");

router.get(
  "/:resumeId",
  authenticate,
  analyzeATS
);

module.exports = router;