const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const {
  getResumes,
  getResume,
  postResume,
  putResume,
  removeResume,
  importResume,
} = require("../controllers/builderResumeController");

router.get("/", authenticate, getResumes);
router.post("/", authenticate, postResume);
router.post("/import", authenticate, importResume);
router.get("/:id", authenticate, getResume);
router.put("/:id", authenticate, putResume);
router.delete("/:id", authenticate, removeResume);

module.exports = router;