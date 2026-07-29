const { generateCareerAdvice, matchJobDescription } = require("../services/careerService");
const getOwnedResume = require("../utils/getOwnedResume");

const getCareerAdvice = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await getOwnedResume(resumeId, req.user.id);

    if (!resume.extractedText) {
      return res.status(400).json({
        success: false,
        message: "Resume Not Parsed Yet",
      });
    }

    const aiResponse = await generateCareerAdvice(resume.extractedText);

    const cleaned = aiResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON",
        raw: cleaned,
      });
    }

    return res.status(200).json({
      success: true,
      ...result,
    });

  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Career Analysis Failed",
    });
  }
};

const matchJob = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { jobDescription } = req.body;

    if (!jobDescription || jobDescription.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Job Description is required",
      });
    }

    const resume = await getOwnedResume(resumeId, req.user.id);

    if (!resume.extractedText) {
      return res.status(400).json({
        success: false,
        message: "Resume Not Parsed Yet",
      });
    }

    const aiResponse = await matchJobDescription(
      resume.extractedText,
      jobDescription
    );

    const cleaned = aiResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON",
        raw: cleaned,
      });
    }

    return res.status(200).json({
      success: true,
      ...result,
    });

  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Job Matching Failed",
    });
  }
};

module.exports = { getCareerAdvice, matchJob };