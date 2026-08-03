const axios = require("axios");

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

async function sendOtpEmail(toEmail, name, otp) {
  const { BREVO_API_KEY, SMTP_FROM_EMAIL, SMTP_FROM_NAME } = process.env;

  if (!BREVO_API_KEY) {
    throw new Error(
      "Email is not configured. Set BREVO_API_KEY (and SMTP_FROM_EMAIL) in your environment."
    );
  }

  if (!SMTP_FROM_EMAIL) {
    throw new Error(
      "SMTP_FROM_EMAIL is not set. It must be an email verified as a sender in your Brevo account."
    );
  }

  const fromName = SMTP_FROM_NAME || "AlgoVerse";

  await axios.post(
    BREVO_API_URL,
    {
      sender: { name: fromName, email: SMTP_FROM_EMAIL },
      to: [{ email: toEmail, name }],
      subject: "Your AlgoVerse verification code",
      textContent: `Hi ${name},\n\nYour verification code is ${otp}. It expires in 10 minutes.\n\nIf you didn't request this, you can ignore this email.`,
      htmlContent: `
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
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 8000,
    }
  );
}

module.exports = { sendOtpEmail };