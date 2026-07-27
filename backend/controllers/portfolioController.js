const {
  getOrCreatePortfolio,
  updatePortfolio,
  setPublish,
  getPublicPortfolio,
  importFromResume,
} = require("../services/portfolioService");
const prisma = require("../utils/prisma");

const getMyPortfolio = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const portfolio = await getOrCreatePortfolio(req.user.id, user?.name);
    return res.status(200).json({ success: true, data: { portfolio } });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to load portfolio",
    });
  }
};

const editMyPortfolio = async (req, res) => {
  try {
    const portfolio = await updatePortfolio(req.user.id, req.body);
    return res.status(200).json({ success: true, data: { portfolio } });
  } catch (error) {
    if (error.message === "SLUG_TAKEN") {
      return res.status(409).json({
        success: false,
        message: "That link is already taken. Try another.",
      });
    }
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to update portfolio",
    });
  }
};

const publishMyPortfolio = async (req, res) => {
  try {
    const { isPublic } = req.body;
    if (typeof isPublic !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isPublic (boolean) is required",
      });
    }
    const portfolio = await setPublish(req.user.id, isPublic);
    return res.status(200).json({ success: true, data: { portfolio } });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to update publish status",
    });
  }
};

const importPortfolioFromResume = async (req, res) => {
  try {
    const { resumeId } = req.body;
    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: "resumeId is required",
      });
    }
    const portfolio = await importFromResume(req.user.id, resumeId);
    return res.status(200).json({ success: true, data: { portfolio } });
  } catch (error) {
    if (error.message === "RESUME_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to import from resume",
    });
  }
};

const getPublicPortfolioBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const portfolio = await getPublicPortfolio(slug);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "This portfolio isn't available.",
      });
    }

    return res.status(200).json({ success: true, data: { portfolio } });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to load portfolio",
    });
  }
};

module.exports = {
  getMyPortfolio,
  editMyPortfolio,
  publishMyPortfolio,
  importPortfolioFromResume,
  getPublicPortfolioBySlug,
};