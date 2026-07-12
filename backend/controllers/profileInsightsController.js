const prisma = require("../utils/prisma");
const { getCodingProfiles } = require("../services/profileInsightsService");
const { analyzeProjects } = require("../services/projectAnalysisService");

const analyzeProfileInsights = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume Not Found",
      });
    }

    if (!resume.extractedText) {
      return res.status(400).json({
        success: false,
        message: "Resume text not extracted yet. Please parse the resume first.",
      });
    }

    const [profiles, projectReport] = await Promise.all([
      getCodingProfiles(resume.extractedText),
      analyzeProjects(resume.extractedText),
    ]);

    return res.status(200).json({
      success: true,
      profiles,
      projects: projectReport.projects || [],
      overallProjectSuggestions: projectReport.overallProjectSuggestions || [],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Profile Insights Analysis Failed",
    });
  }
};

module.exports = { analyzeProfileInsights };