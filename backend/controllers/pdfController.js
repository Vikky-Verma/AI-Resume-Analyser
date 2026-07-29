const prisma = require("../utils/prisma");
const { generateCareerAdvice: getCareer } = require("../services/careerService");
const generateResumePDF = require("../services/pdfService");
const getOwnedResume = require("../utils/getOwnedResume");

const downloadReport = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await getOwnedResume(resumeId, req.user.id);

    if (!resume.extractedText) {
      return res.status(400).json({ success: false, message: "Resume Not Parsed Yet" });
    }

    // Fetch analysis from DB
    let analysisData = null;
    try {
      analysisData = await prisma.analysis.findUnique({
        where: { resumeId },
      });
    } catch (_) {
      console.log("No analysis found");
    }

    // Get career advice
    let career = null;
    try {
      const careerRaw = await getCareer(resume.extractedText);
      const careerCleaned = careerRaw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      career = JSON.parse(careerCleaned);
    } catch (_) {
      console.log("Career advice failed");
    }

    // Read job match from query params (sent from frontend)
    const jobMatch = req.query.matchScore
      ? {
          matchScore:    Number(req.query.matchScore),
          matchedSkills: JSON.parse(req.query.matchedSkills || "[]"),
          missingSkills: JSON.parse(req.query.missingSkills || "[]"),
          suggestions:   JSON.parse(req.query.suggestions   || "[]"),
        }
      : null;

    const pdfData = {
      analysis: analysisData
        ? {
            score:         analysisData.score,
            atsScore:      analysisData.atsScore,
            skills:        analysisData.skills,
            missingSkills: analysisData.missingSkills,
            suggestions:   analysisData.suggestions,
          }
        : null,
      career:   career   || null,
      jobMatch: jobMatch || null,
    };

    const pdfBuffer = await generateResumePDF(pdfData);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="resume-report-${resumeId}.pdf"`
    );
    res.send(pdfBuffer);

  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "PDF Generation Failed" });
  }
};

module.exports = { downloadReport };