const prisma = require("../utils/prisma");
const { analyzeProjects } = require("../services/projectAnalysisService");

const analyzeProjectIntelligence = async (req, res) => {
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

    const report = await analyzeProjects(resume.extractedText);

    return res.status(200).json({
      success: true,
      projects: report.projects || [],
      overallProjectSuggestions: report.overallProjectSuggestions || [],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Project Analysis Failed",
    });
  }
};

module.exports = { analyzeProjectIntelligence };