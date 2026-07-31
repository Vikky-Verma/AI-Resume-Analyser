const crypto = require("crypto");

const OTP_LENGTH = 6;
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 45 * 1000; // 45 seconds
const MAX_ATTEMPTS = 5;

function generateOtp() {
  const otp = crypto.randomInt(0, 1_000_000).toString().padStart(OTP_LENGTH, "0");
  return otp;
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function getExpiry() {
  return new Date(Date.now() + OTP_TTL_MS);
}

module.exports = {
  generateOtp,
  hashOtp,
  getExpiry,
  OTP_TTL_MS,
  RESEND_COOLDOWN_MS,
  MAX_ATTEMPTS,
};