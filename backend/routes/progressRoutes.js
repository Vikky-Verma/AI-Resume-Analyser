const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const { getSummary } = require("../controllers/progressController");

router.get("/summary", authenticate, getSummary);

module.exports = router;