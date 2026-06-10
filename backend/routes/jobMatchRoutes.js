const express = require("express");

const router = express.Router();

const authenticate =
  require("../middleware/authMiddleware");

const {
  matchJobDescription,
} = require(
  "../controllers/jobMatchController"
);

router.post(
  "/:resumeId",
  authenticate,
  matchJobDescription
);

module.exports = router;