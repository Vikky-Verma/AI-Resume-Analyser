const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const { getLeetCode, getCodeforces } = require("../controllers/dsaController");

router.get("/leetcode/:username", authenticate, getLeetCode);
router.get("/codeforces/:handle", authenticate, getCodeforces);

module.exports = router;