const prisma = require("../utils/prisma");
const { generateCareerAdvice: getCareer } = require("../services/careerService");
const generateResumePDF = require("../services/pdfService");

const downloadReport = async (req, res) => {
  try {
    const { resumeId } = req.params;

    // 1. Fetch resume
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume Not Found" });
    }

    if (!resume.extractedText) {
      return res.status(400).json({ success: false, message: "Resume Not Parsed Yet" });
    }

    // 2. Fetch analysis — your schema has ONE model for both analysis + ATS
    let analysisData = null;
    try {
      analysisData = await prisma.analysis.findUnique({
        where: { resumeId },
      });
    } catch (_) {
      console.log("⚠️ No analysis data found — skipping");
    }

    // 3. Get career advice from AI
    let career = null;
    try {
      const careerRaw = await getCareer(resume.extractedText);
      const careerCleaned = careerRaw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      career = JSON.parse(careerCleaned);
    } catch (_) {
      console.log("⚠️ Career advice failed — skipping");
    }

    // 4. Build data object — map your Analysis model fields correctly
    const pdfData = {
      analysis: analysisData
        ? {
            overallScore: analysisData.score,
            strengths: analysisData.skills,        // Json field from your schema
            improvements: analysisData.suggestions, // Json field from your schema
          }
        : null,

      ats: analysisData
        ? {
            atsScore: analysisData.atsScore,
            matchedKeywords: analysisData.skills,       // reuse skills as matched
            missingKeywords: analysisData.missingSkills, // Json field from your schema
          }
        : null,

      career: career || null,
    };

    // 5. Generate PDF buffer
    const pdfBuffer = await generateResumePDF(pdfData);

    // 6. Send as downloadable file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="resume-report-${resumeId}.pdf"`
    );
    res.send(pdfBuffer);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "PDF Generation Failed" });
  }
};

module.exports = { downloadReport };