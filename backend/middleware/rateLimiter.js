const rateLimit = require("express-rate-limit");

// Applies to both /register and /login — 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true, // sends RateLimit-* headers
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again in 15 minutes.",
  },
});

module.exports = { authLimiter };