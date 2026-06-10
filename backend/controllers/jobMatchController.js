const prisma = require("../utils/prisma");

const matchJobDescription = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const { jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        message: "Job Description Required",
      });
    }

    const analysis =
      await prisma.analysis.findUnique({
        where: {
          resumeId,
        },
      });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message:
          "Resume Analysis Not Found",
      });
    }

    const resumeSkills =
      analysis.skills.map((skill) =>
        skill.toLowerCase()
      );

    const jdWords =
      jobDescription
        .toLowerCase()
        .split(/[\s,.\n]+/);

    const matchedSkills = [];
    const missingSkills = [];

    resumeSkills.forEach((skill) => {
      if (
        jdWords.includes(
          skill.toLowerCase()
        )
      ) {
        matchedSkills.push(skill);
      }
    });

    const importantSkills = [
      "react",
      "node.js",
      "express",
      "mongodb",
      "postgresql",
      "docker",
      "aws",
      "kubernetes",
      "redis",
      "terraform",
      "typescript",
    ];

    importantSkills.forEach((skill) => {
      if (
        jdWords.includes(skill) &&
        !resumeSkills.includes(skill)
      ) {
        missingSkills.push(skill);
      }
    });

    const matchPercentage =
      Math.round(
        (matchedSkills.length /
          (matchedSkills.length +
            missingSkills.length || 1)) *
          100
      );

    return res.status(200).json({
      success: true,
      matchPercentage,
      matchedSkills,
      missingSkills,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message:
        "Job Matching Failed",
    });
  }
};

module.exports = {
  matchJobDescription,
};