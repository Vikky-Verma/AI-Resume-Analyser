const axios = require("axios");

const RESEND_API_URL = "https://api.resend.com/emails";

async function sendOtpEmail(toEmail, name, otp) {
  const { RESEND_API_KEY, SMTP_FROM_EMAIL, SMTP_FROM_NAME } = process.env;

  if (!RESEND_API_KEY) {
    throw new Error(
      "Email is not configured. Set RESEND_API_KEY (and SMTP_FROM_EMAIL) in your environment."
    );
  }

  const fromName = SMTP_FROM_NAME || "AlgoVerse";
  const fromEmail = SMTP_FROM_EMAIL || "onboarding@resend.dev";

  await axios.post(
    RESEND_API_URL,
    {
      from: `${fromName} <${fromEmail}>`,
      to: [toEmail],
      subject: "Your AlgoVerse verification code",
      text: `Hi ${name},\n\nYour verification code is ${otp}. It expires in 10 minutes.\n\nIf you didn't request this, you can ignore this email.`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Verify your email</h2>
          <p>Hi ${name},</p>
          <p>Your verification code is:</p>
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${otp}</p>
          <p style="color: #666;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    },
    {
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 8000,
    }
  );
}

module.exports = { sendOtpEmail };