const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const {
  getApplications,
  addApplication,
  editApplication,
  moveApplicationCard,
  removeApplication,
} = require("../controllers/applicationController");

router.get("/", authenticate, getApplications);
router.post("/", authenticate, addApplication);
router.patch("/:id", authenticate, editApplication);
router.patch("/:id/move", authenticate, moveApplicationCard);
router.delete("/:id", authenticate, removeApplication);

module.exports = router;