const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const { getLeetCode } = require("../controllers/dsaController");

router.get("/leetcode/:username", authenticate, getLeetCode);

module.exports = router;