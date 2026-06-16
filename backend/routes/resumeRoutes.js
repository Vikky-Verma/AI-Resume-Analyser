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
  deleteResume, // ✅ added
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

// Parse Resume
router.post(
  "/parse/:resumeId",
  authenticate,
  parseResume
);

// ✅ Delete Resume
router.delete(
  "/:id",
  authenticate,
  deleteResume
);

module.exports = router;