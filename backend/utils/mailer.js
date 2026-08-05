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

async function sendContactEmail({ name, email, message }) {
  const { BREVO_API_KEY, SMTP_FROM_EMAIL, SMTP_FROM_NAME, CONTACT_TO_EMAIL } = process.env;

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
  // Where the contact form submission lands — defaults to the same verified
  // sender address if a dedicated inbox isn't configured.
  const toEmail = CONTACT_TO_EMAIL || SMTP_FROM_EMAIL;

  const escapeHtml = (str) =>
    String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  // Notify the team
  await axios.post(
    BREVO_API_URL,
    {
      sender: { name: fromName, email: SMTP_FROM_EMAIL },
      to: [{ email: toEmail }],
      replyTo: { name, email },
      subject: `New contact form message from ${name}`,
      textContent: `From: ${name} <${email}>\n\n${message}`,
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
          <h2>New contact form message</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p style="white-space: pre-wrap; border-left: 3px solid #6366f1; padding-left: 12px; margin-top: 16px;">${escapeHtml(message)}</p>
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

  // Confirmation to the sender
  await axios.post(
    BREVO_API_URL,
    {
      sender: { name: fromName, email: SMTP_FROM_EMAIL },
      to: [{ email, name }],
      subject: "We received your message",
      textContent: `Hi ${name},\n\nThanks for reaching out — we received your message and will get back to you within 1-2 business days.\n\nYour message:\n${message}`,
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>We got your message</h2>
          <p>Hi ${escapeHtml(name)},</p>
          <p>Thanks for reaching out — we'll get back to you within 1-2 business days.</p>
          <p style="color: #666; white-space: pre-wrap; border-left: 3px solid #2e3150; padding-left: 12px;">${escapeHtml(message)}</p>
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

module.exports = { sendOtpEmail, sendContactEmail };