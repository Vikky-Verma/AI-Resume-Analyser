const { analyzeProjects } = require("../services/projectAnalysisService");
const getOwnedResume = require("../utils/getOwnedResume");

const analyzeProjectIntelligence = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await getOwnedResume(resumeId, req.user.id);

    if (!resume.extractedText) {
      return res.status(400).json({
        success: false,
        message: "Resume text not extracted yet. Please parse the resume first.",
      });
    }

    const report = await analyzeProjects(resume.extractedText);

    return res.status(200).json({
      success: true,
      projects: report.projects || [],
      overallProjectSuggestions: report.overallProjectSuggestions || [],
    });
  } catch (error) {
    console.log(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Project Analysis Failed",
    });
  }
};

module.exports = { analyzeProjectIntelligence };