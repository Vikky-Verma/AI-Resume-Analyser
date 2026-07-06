const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const {
  startInterview,
  getMyInterviews,
  getInterview,
  submitAnswer,
  completeInterview,
} = require("../controllers/interviewController");

router.post("/start", authenticate, startInterview);
router.get("/my-interviews", authenticate, getMyInterviews);
router.get("/:interviewId", authenticate, getInterview);
router.post("/:interviewId/answer", authenticate, submitAnswer);
router.post("/:interviewId/complete", authenticate, completeInterview);

module.exports = router;