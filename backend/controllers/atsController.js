const prisma = require("../utils/prisma");

const analyzeATS = async (req, res) => {
  try {
    const { resumeId } = req.params;

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

    const text =
      resume.extractedText || "";

    const passedChecks = [];
    const failedChecks = [];

    let score = 0;

    // Email
    if (
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(
        text
      )
    ) {
      passedChecks.push("Email Found");
      score += 10;
    } else {
      failedChecks.push("Email Missing");
    }

    // Phone
    if (
      /(\+91)?[6-9]\d{9}/.test(text)
    ) {
      passedChecks.push("Phone Found");
      score += 10;
    } else {
      failedChecks.push("Phone Missing");
    }

    // LinkedIn
    if (
      text.toLowerCase().includes(
        "linkedin"
      )
    ) {
      passedChecks.push(
        "LinkedIn Found"
      );
      score += 10;
    } else {
      failedChecks.push(
        "LinkedIn Missing"
      );
    }

    // GitHub
    if (
      text.toLowerCase().includes(
        "github"
      )
    ) {
      passedChecks.push(
        "GitHub Found"
      );
      score += 10;
    } else {
      failedChecks.push(
        "GitHub Missing"
      );
    }

    // Education
    if (
      text.toLowerCase().includes(
        "education"
      )
    ) {
      passedChecks.push(
        "Education Section Found"
      );
      score += 10;
    } else {
      failedChecks.push(
        "Education Section Missing"
      );
    }

    // Skills
    if (
      text.toLowerCase().includes(
        "skills"
      )
    ) {
      passedChecks.push(
        "Skills Section Found"
      );
      score += 10;
    } else {
      failedChecks.push(
        "Skills Section Missing"
      );
    }

    // Projects
    if (
      text.toLowerCase().includes(
        "project"
      )
    ) {
      passedChecks.push(
        "Projects Section Found"
      );
      score += 10;
    } else {
      failedChecks.push(
        "Projects Section Missing"
      );
    }

    // Experience
    if (
      text.toLowerCase().includes(
        "experience"
      )
    ) {
      passedChecks.push(
        "Experience Section Found"
      );
      score += 10;
    } else {
      failedChecks.push(
        "Experience Section Missing"
      );
    }

    // Resume Length
    if (text.length > 1000) {
      passedChecks.push(
        "Good Resume Length"
      );
      score += 10;
    } else {
      failedChecks.push(
        "Resume Too Short"
      );
    }

    // Keywords
    const keywords = [
      "react",
      "node",
      "express",
      "mongodb",
      "postgresql",
      "docker",
      "aws",
    ];

    const found =
      keywords.filter((keyword) =>
        text
          .toLowerCase()
          .includes(keyword)
      );

    score += Math.min(
      found.length * 2,
      10
    );

    res.status(200).json({
      success: true,
      atsScore: score,
      passedChecks,
      failedChecks,
      keywordsFound: found,
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