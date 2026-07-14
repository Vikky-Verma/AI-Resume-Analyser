const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const {
  getCompanies,
  getCompanyDetail,
  updateProgress,
} = require("../controllers/companyPrepController");

router.get("/companies", authenticate, getCompanies);
router.get("/companies/:slug", authenticate, getCompanyDetail);
router.post("/companies/:slug/progress", authenticate, updateProgress);

module.exports = router;