const prisma = require("../utils/prisma");
const { sendContactEmail } = require("../utils/mailer");

const submitContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Persist first, so the submission is never lost even if email delivery fails.
    await prisma.contactMessage.create({
      data: { name, email, message },
    });

    res.status(200).json({
      success: true,
      message: "Message sent — we'll get back to you shortly.",
    });

    try {
      await sendContactEmail({ name, email, message });
    } catch (emailErr) {
      console.error(
        "Failed to send contact email for",
        email,
        emailErr?.response?.data || emailErr.message
      );
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
};

module.exports = { submitContactMessage };