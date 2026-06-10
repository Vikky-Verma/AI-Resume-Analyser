const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const { downloadReport } = require("../controllers/pdfController");

router.get("/:resumeId", authenticate, downloadReport);

module.exports = router;