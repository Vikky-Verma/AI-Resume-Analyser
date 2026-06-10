const prisma = require("../utils/prisma");

const analyzeResume =
  require("../services/aiAnalysisService");

const createAnalysis = async (req, res) => {
  try {
    const { resumeId } = req.params;

    // Find Resume
    const resume =
      await prisma.resume.findUnique({
        where: {
          id: resumeId,
        },
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
        message:
          "Resume text not extracted yet",
      });
    }

    // AI Analysis
    const aiResponse =
      await analyzeResume(
        resume.extractedText
      );

    console.log(
      "===== GROQ RESPONSE ====="
    );
    console.log(aiResponse);
    console.log(
      "========================="
    );

    const cleaned =
      aiResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    console.log(
      "===== CLEANED RESPONSE ====="
    );
    console.log(cleaned);
    console.log(
      "============================"
    );

    let result;

    try {
      result = JSON.parse(cleaned);
    } catch (err) {
      console.log(
        "JSON Parse Error:",
        err.message
      );

      return res.status(500).json({
        success: false,
        message: "Invalid AI Response",
        aiResponse: cleaned,
      });
    }

    // Validation
    if (
      result.score === undefined ||
      result.atsScore === undefined ||
      !Array.isArray(result.skills) ||
      !Array.isArray(result.missingSkills) ||
      !Array.isArray(result.suggestions)
    ) {
      return res.status(500).json({
        success: false,
        message:
          "AI response missing required fields",
        result,
      });
    }

    // Create or Update Analysis
    const analysis =
      await prisma.analysis.upsert({
        where: {
          resumeId,
        },

        update: {
          score: Number(result.score),
          atsScore: Number(result.atsScore),

          skills: result.skills,

          missingSkills:
            result.missingSkills,

          suggestions:
            result.suggestions,
        },

        create: {
          score: Number(result.score),
          atsScore: Number(result.atsScore),

          skills: result.skills,

          missingSkills:
            result.missingSkills,

          suggestions:
            result.suggestions,

          resumeId,
        },
      });

    return res.status(200).json({
      success: true,
      analysis,
    });

  } catch (error) {
    console.log(
      "===== ANALYSIS ERROR ====="
    );
    console.log(error);
    console.log(
      "=========================="
    );

    return res.status(500).json({
      success: false,
      message: "Analysis Failed",
      error: error.message,
    });
  }
};

module.exports = {
  createAnalysis,
};