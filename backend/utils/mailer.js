const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in your .env"
    );
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
}

async function sendOtpEmail(toEmail, name, otp) {
  const fromName = process.env.SMTP_FROM_NAME || "AlgoVerse";
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  await getTransporter().sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: toEmail,
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
  });
}

module.exports = { sendOtpEmail };