const { getLeetCodeStats } = require("../services/dsaService");

const getLeetCode = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username || !username.trim()) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const stats = await getLeetCodeStats(username.trim());

    return res.status(200).json({
      success: true,
      platform: "leetcode",
      data: stats,
    });
  } catch (error) {
    console.log(error);

    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: "LeetCode user not found",
      });
    }

    if (error.statusCode === 502) {
      return res.status(502).json({
        success: false,
        message: "LeetCode is temporarily unreachable from our server. Please try again shortly.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch LeetCode stats",
    });
  }
};

module.exports = { getLeetCode };