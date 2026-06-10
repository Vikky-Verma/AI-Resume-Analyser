const express = require("express");

const router = express.Router();

const authenticate =
  require("../middleware/authMiddleware");

const upload =
  require("../middleware/uploadMiddleware");

const {
  uploadResume,
  getMyResumes,
  parseResume,
} = require("../controllers/resumeController");

// Upload Resume
router.post(
  "/upload",
  authenticate,
  upload.single("resume"),
  uploadResume
);

// Get Upload History
router.get(
  "/my-resumes",
  authenticate,
  getMyResumes
);

router.post(
  "/parse/:resumeId",
  authenticate,
  parseResume
);

module.exports = router;