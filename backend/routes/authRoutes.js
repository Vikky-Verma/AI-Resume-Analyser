const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = require("../utils/prisma");
const authenticate = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { authLimiter, otpLimiter } = require("../middleware/rateLimiter");
const {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
} = require("../validators/authValidator");
const { generateOtp, hashOtp, getExpiry, RESEND_COOLDOWN_MS, MAX_ATTEMPTS } = require("../utils/otp");
const { sendOtpEmail } = require("../utils/mailer");

const router = express.Router();

// Step 1: user submits name/email/password — we stage it and email a code.
// No row is created in the real User table until the code is verified.
router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          message: "User already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const otp = generateOtp();

      await prisma.otpVerification.upsert({
        where: { email },
        create: {
          name,
          email,
          password: hashedPassword,
          otpHash: hashOtp(otp),
          expiresAt: getExpiry(),
        },
        update: {
          name,
          password: hashedPassword,
          otpHash: hashOtp(otp),
          expiresAt: getExpiry(),
          attempts: 0,
          lastSentAt: new Date(),
        },
      });

      await sendOtpEmail(email, name, otp);

      res.status(200).json({
        message: "Verification code sent to your email",
        email,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Server Error",
      });
    }
  }
);

// Step 2: user submits the 6-digit code — only now does the real User row get created.
router.post(
  "/register/verify-otp",
  otpLimiter,
  validate(verifyOtpSchema),
  async (req, res) => {
    try {
      const { email, otp } = req.body;

      const pending = await prisma.otpVerification.findUnique({
        where: { email },
      });

      if (!pending) {
        return res.status(400).json({
          message: "No pending verification for this email. Please register again.",
        });
      }

      if (pending.expiresAt < new Date()) {
        return res.status(400).json({
          message: "Code expired. Please request a new one.",
        });
      }

      if (pending.attempts >= MAX_ATTEMPTS) {
        return res.status(429).json({
          message: "Too many incorrect attempts. Please request a new code.",
        });
      }

      if (hashOtp(otp) !== pending.otpHash) {
        await prisma.otpVerification.update({
          where: { email },
          data: { attempts: { increment: 1 } },
        });
        return res.status(400).json({
          message: "Incorrect code. Please try again.",
        });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        await prisma.otpVerification.delete({ where: { email } });
        return res.status(400).json({ message: "User already exists" });
      }

      await prisma.user.create({
        data: {
          name: pending.name,
          email: pending.email,
          password: pending.password,
        },
      });

      await prisma.otpVerification.delete({ where: { email } });

      res.status(201).json({ message: "Email verified, account created" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

// Resend: same code slot, new OTP, enforced cooldown so it can't be spammed.
router.post(
  "/register/resend-otp",
  otpLimiter,
  validate(resendOtpSchema),
  async (req, res) => {
    try {
      const { email } = req.body;

      const pending = await prisma.otpVerification.findUnique({
        where: { email },
      });

      if (!pending) {
        return res.status(400).json({
          message: "No pending verification for this email. Please register again.",
        });
      }

      const sinceLast = Date.now() - new Date(pending.lastSentAt).getTime();
      if (sinceLast < RESEND_COOLDOWN_MS) {
        const waitSec = Math.ceil((RESEND_COOLDOWN_MS - sinceLast) / 1000);
        return res.status(429).json({
          message: `Please wait ${waitSec}s before requesting another code.`,
        });
      }

      const otp = generateOtp();

      await prisma.otpVerification.update({
        where: { email },
        data: {
          otpHash: hashOtp(otp),
          expiresAt: getExpiry(),
          attempts: 0,
          lastSentAt: new Date(),
        },
      });

      await sendOtpEmail(email, pending.name, otp);

      res.status(200).json({ message: "Verification code resent" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(400).json({
          message: "Invalid Credentials",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          message: "Invalid Credentials",
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Server Error",
      });
    }
  }
);

router.get("/me", authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  res.json(user);
});

module.exports = router;