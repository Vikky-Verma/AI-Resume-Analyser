const prisma = require("../utils/prisma");
const { generateATSReport } = require("../services/atsAnalysisService");

const analyzeATS = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { targetRole, experienceLevel } = req.body;

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

    const report = await generateATSReport(
      resume.extractedText,
      targetRole,
      experienceLevel
    );

    if (!report.isResume) {
      return res.status(400).json({
        success: false,
        isResume: false,
        message: report.message || "This does not appear to be a resume.",
      });
    }

    if (report.parseError) {
      return res.status(500).json({
        success: false,
        message: report.message,
        raw: report.raw,
      });
    }

    return res.status(200).json({
      success: true,
      targetRole: targetRole || "General",
      experienceLevel: experienceLevel || "Fresher",
      ...report,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "ATS Analysis Failed",
    });
  }
};

module.exports = {
  analyzeATS,
};