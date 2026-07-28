const { getProgressSummary } = require("../services/progressService");

const getSummary = async (req, res) => {
  try {
    const summary = await getProgressSummary(req.user.id);

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to load progress summary",
    });
  }
};

module.exports = { getSummary };