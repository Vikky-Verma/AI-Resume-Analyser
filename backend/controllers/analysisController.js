const prisma = require("../utils/prisma");
const analyzeResume = require("../services/aiAnalysisService");

const createAnalysis = async (req, res) => {
  try {
    const { resumeId } = req.params;

    // Find Resume
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

    // AI Analysis
    const aiResponse = await analyzeResume(resume.extractedText);

    console.log("===== AI RESPONSE =====");
    console.log(typeof aiResponse, aiResponse);
    console.log("=======================");

    // Parse result
    let result;

    if (typeof aiResponse === "object") {
      // Already parsed object
      result = aiResponse;
    } else if (typeof aiResponse === "string") {
      try {
        result = JSON.parse(aiResponse);
      } catch (err) {
        console.log("JSON Parse Error:", err.message);
        console.log("Raw response:", aiResponse);
        return res.status(500).json({
          success: false,
          message: "AI returned invalid JSON. Please try again.",
          raw: aiResponse.slice(0, 500),
        });
      }
    } else {
      return res.status(500).json({
        success: false,
        message: "Unexpected AI response type",
      });
    }

    // Not a resume
    if (result.isResume === false) {
      return res.status(400).json({
        success: false,
        isResume: false,
        message: result.message || "This does not appear to be a resume. Please upload a valid resume.",
      });
    }

    // Validate required fields
    if (
      result.score === undefined ||
      result.atsScore === undefined ||
      !Array.isArray(result.skills) ||
      !Array.isArray(result.missingSkills) ||
      !Array.isArray(result.suggestions)
    ) {
      console.log("Missing fields in result:", result);
      return res.status(500).json({
        success: false,
        message: "AI response is missing required fields. Please try again.",
        received: Object.keys(result),
      });
    }

    // Save to DB
    const analysis = await prisma.analysis.upsert({
      where: { resumeId },
      update: {
        score: Number(result.score),
        atsScore: Number(result.atsScore),
        domain: result.domain || null,
        experienceLevel: result.experienceLevel || null,
        skills: result.skills,
        missingSkills: result.missingSkills,
        suggestions: result.suggestions,
      },
      create: {
        score: Number(result.score),
        atsScore: Number(result.atsScore),
        domain: result.domain || null,
        experienceLevel: result.experienceLevel || null,
        skills: result.skills,
        missingSkills: result.missingSkills,
        suggestions: result.suggestions,
        resumeId,
      },
    });

    return res.status(200).json({
      success: true,
      isResume: true,
      analysis,
    });

  } catch (error) {
    console.log("===== ANALYSIS ERROR =====");
    console.log("Message:", error.message);
    console.log("Stack:", error.stack);
    console.log("==========================");

    return res.status(500).json({
      success: false,
      message: error.message || "Analysis Failed",
    });
  }
};

module.exports = { createAnalysis };