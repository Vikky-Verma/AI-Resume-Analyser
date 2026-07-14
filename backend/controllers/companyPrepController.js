const {
  listCompanies,
  getCompany,
  getDistinctTiers,
  getRankingMethod,
  getProgress,
  getProgressSummary,
  toggleQuestion,
} = require("../services/companyPrepService");

const getCompanies = async (req, res) => {
  try {
    const companies = listCompanies();
    const tiers = getDistinctTiers();
    const rankingMethod = getRankingMethod();

    let progressSummary = {};
    if (req.user?.id) {
      progressSummary = await getProgressSummary(req.user.id);
    }

    return res.status(200).json({
      success: true,
      data: {
        companies,
        tiers,
        rankingMethod,
        progressSummary, // { [slug]: solvedCount }
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to load company list",
    });
  }
};

const getCompanyDetail = async (req, res) => {
  try {
    const { slug } = req.params;
    const company = getCompany(slug);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    let solvedIds = [];
    if (req.user?.id) {
      solvedIds = await getProgress(req.user.id, slug);
    }

    return res.status(200).json({
      success: true,
      data: { ...company, solvedIds },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to load company details",
    });
  }
};

const updateProgress = async (req, res) => {
  try {
    const { slug } = req.params;
    const { questionId, solved } = req.body;

    if (!getCompany(slug)) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    if (!questionId || typeof solved !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "questionId and solved (boolean) are required",
      });
    }

    const solvedIds = await toggleQuestion(
      req.user.id,
      slug,
      questionId,
      solved
    );

    return res.status(200).json({
      success: true,
      data: { solvedIds },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to update progress",
    });
  }
};

module.exports = { getCompanies, getCompanyDetail, updateProgress };