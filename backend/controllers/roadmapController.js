const prisma = require("../utils/prisma");
const { generateRoadmap } = require("../services/roadmapService");

const VALID_TIMEFRAMES = [4, 8, 12, 24];

const analyzeRoadmap = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { targetRole, timeframeWeeks } = req.body;

    if (!targetRole || !targetRole.trim()) {
      return res.status(400).json({
        success: false,
        message: "Target role is required",
      });
    }

    const weeks = VALID_TIMEFRAMES.includes(Number(timeframeWeeks))
      ? Number(timeframeWeeks)
      : 8;

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

    const report = await generateRoadmap(
      resume.extractedText,
      targetRole.trim(),
      weeks
    );

    if (report.isResume === false) {
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
      targetRole: targetRole.trim(),
      timeframeWeeks: weeks,
      ...report,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Roadmap Generation Failed",
    });
  }
};

module.exports = { analyzeRoadmap };
