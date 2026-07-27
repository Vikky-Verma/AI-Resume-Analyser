const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const {
  getMyPortfolio,
  editMyPortfolio,
  publishMyPortfolio,
  importPortfolioFromResume,
  getPublicPortfolioBySlug,
} = require("../controllers/portfolioController");

// Public — no auth. Must be registered before any conflicting param routes.
router.get("/public/:slug", getPublicPortfolioBySlug);

router.get("/me", authenticate, getMyPortfolio);
router.put("/me", authenticate, editMyPortfolio);
router.patch("/me/publish", authenticate, publishMyPortfolio);
router.post("/import", authenticate, importPortfolioFromResume);

module.exports = router;