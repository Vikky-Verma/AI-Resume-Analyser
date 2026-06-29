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
        message: "Resume text not extracted yet",
      });
    }

    // Check minimum word count
    const wordCount = resume.extractedText.trim().split(/\s+/).length;
    if (wordCount < 50) {
      return res.status(400).json({
        success: false,
        isResume: false,
        message:
          "The PDF appears to be empty or has very little text. Please upload a text-based resume, not a scanned image.",
      });
    }

    // AI Analysis
    const aiResponse = await analyzeResume(resume.extractedText);

    console.log("===== AI RESPONSE =====");
    console.log(aiResponse);
    console.log("=======================");

    // Handle object response (when isResume is false)
    // aiAnalysisService returns plain object for non-resumes
    if (typeof aiResponse === "object" && aiResponse?.isResume === false) {
      return res.status(400).json({
        success: false,
        isResume: false,
        message: aiResponse.message,
      });
    }

    // Clean string response
    const cleaned =
      typeof aiResponse === "string"
        ? aiResponse
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim()
        : JSON.stringify(aiResponse);

    console.log("===== CLEANED RESPONSE =====");
    console.log(cleaned);
    console.log("============================");

    // Parse JSON
    let result;
    try {
      result = JSON.parse(cleaned);
    } catch (err) {
      console.log("JSON Parse Error:", err.message);
      return res.status(500).json({
        success: false,
        message: "Invalid AI Response — could not parse JSON",
        aiResponse: cleaned,
      });
    }

    // Check if AI itself said not a resume
    if (result?.isResume === false) {
      return res.status(400).json({
        success: false,
        isResume: false,
        message:
          result.message ||
          "The uploaded PDF does not appear to be a resume or CV. Please upload a valid resume.",
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
      return res.status(500).json({
        success: false,
        message: "AI response missing required fields",
        result,
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
    console.log(error);
    console.log("==========================");

    return res.status(500).json({
      success: false,
      message: "Analysis Failed",
      error: error.message,
    });
  }
};

module.exports = { createAnalysis };