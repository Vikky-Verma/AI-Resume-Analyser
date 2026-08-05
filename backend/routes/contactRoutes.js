const express = require("express");

const router = express.Router();

const validate = require("../middleware/validate");
const { contactLimiter } = require("../middleware/rateLimiter");
const { contactSchema } = require("../validators/contactValidator");
const { submitContactMessage } = require("../controllers/contactController");

router.post("/", contactLimiter, validate(contactSchema), submitContactMessage);

module.exports = router;