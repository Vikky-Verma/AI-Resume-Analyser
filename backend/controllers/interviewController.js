const prisma = require("../utils/prisma");
const {
  generateQuestions,
  scoreAnswer,
  generateOverallFeedback,
} = require("../services/interviewService");

const ROUND_META = {
  hr: { type: "HR", label: "HR Round" },
  technical: { type: "TECHNICAL", label: "Technical Round" },
  dsa: { type: "DSA", label: "DSA Round" },
};

const buildRounds = (questionSets) =>
  ["hr", "technical", "dsa"].map((key) => ({
    type: ROUND_META[key].type,
    label: ROUND_META[key].label,
    score: null,
    questions: questionSets[key].map((question) => ({
      question,
      answer: null,
      score: null,
      feedback: null,
    })),
  }));

const startInterview = async (req, res) => {
  try {
    const { resumeId, company, role, level } = req.body;

    if (!company?.trim() || !role?.trim() || !level?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company, role and level are required",
      });
    }

    if (!["Fresher", "Intermediate", "Advanced"].includes(level)) {
      return res.status(400).json({
        success: false,
        message: "Level must be Fresher, Intermediate or Advanced",
      });
    }

    let resumeText = "";
    if (resumeId) {
      const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
      if (!resume || resume.userId !== req.user.id) {
        return res.status(404).json({ success: false, message: "Resume Not Found" });
      }
      resumeText = resume.extractedText || "";
    }

    if (!resumeText.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Please analyze/parse this resume first (Run AI Analysis on the resume page) before starting a mock interview.",
      });
    }

    const questionSets = await generateQuestions(resumeText, company, role, level);
    const rounds = buildRounds(questionSets);

    const interview = await prisma.mockInterview.create({
      data: {
        userId: req.user.id,
        resumeId: resumeId || null,
        company: company.trim(),
        role: role.trim(),
        level,
        rounds,
      },
    });

    return res.status(201).json({ success: true, interview });
  } catch (error) {
    console.log("===== START INTERVIEW ERROR =====", error);
    return res.status(500).json({
      success: false,
      message: "Failed to start interview. Please try again.",
      error: error.message,
    });
  }
};

const getMyInterviews = async (req, res) => {
  try {
    const interviews = await prisma.mockInterview.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        company: true,
        role: true,
        level: true,
        status: true,
        overallScore: true,
        verdict: true,
        createdAt: true,
        completedAt: true,
      },
    });
    return res.status(200).json({ success: true, interviews });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Failed to fetch interviews" });
  }
};

const getInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const interview = await prisma.mockInterview.findUnique({ where: { id: interviewId } });

    if (!interview || interview.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: "Interview Not Found" });
    }

    return res.status(200).json({ success: true, interview });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Failed to fetch interview" });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { roundIndex, questionIndex, answer } = req.body;

    const interview = await prisma.mockInterview.findUnique({ where: { id: interviewId } });
    if (!interview || interview.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: "Interview Not Found" });
    }

    const rounds = interview.rounds;
    const round = rounds[roundIndex];
    const questionObj = round?.questions?.[questionIndex];

    if (!round || !questionObj) {
      return res.status(400).json({ success: false, message: "Invalid round/question index" });
    }

    const { score, feedback } = await scoreAnswer(round.type, questionObj.question, answer, {
      company: interview.company,
      role: interview.role,
      level: interview.level,
    });

    round.questions[questionIndex] = {
      ...questionObj,
      answer,
      score,
      feedback,
    };

    const answeredScores = round.questions
      .filter((q) => q.score !== null && q.score !== undefined)
      .map((q) => q.score);
    if (answeredScores.length === round.questions.length) {
      round.score = Number(
        (answeredScores.reduce((a, b) => a + b, 0) / answeredScores.length).toFixed(1)
      );
    }

    rounds[roundIndex] = round;

    await prisma.mockInterview.update({
      where: { id: interviewId },
      data: { rounds },
    });

    return res.status(200).json({ success: true, score, feedback, roundScore: round.score });
  } catch (error) {
    console.log("===== SUBMIT ANSWER ERROR =====", error);
    return res.status(500).json({
      success: false,
      message: "Failed to score answer. Please try again.",
      error: error.message,
    });
  }
};

const completeInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const interview = await prisma.mockInterview.findUnique({ where: { id: interviewId } });

    if (!interview || interview.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: "Interview Not Found" });
    }

    const rounds = interview.rounds;

    rounds.forEach((round) => {
      const scored = round.questions.filter((q) => q.score !== null && q.score !== undefined);
      if (scored.length > 0) {
        round.score = Number(
          (scored.reduce((a, b) => a + b.score, 0) / scored.length).toFixed(1)
        );
      } else {
        round.score = 0;
      }
    });

    const overallScore = Number(
      ((rounds.reduce((a, r) => a + (r.score || 0), 0) / rounds.length) * 10).toFixed(1)
    );

    const { verdict, summary } = await generateOverallFeedback(rounds, {
      company: interview.company,
      role: interview.role,
      level: interview.level,
    });

    const updated = await prisma.mockInterview.update({
      where: { id: interviewId },
      data: {
        rounds,
        status: "completed",
        overallScore,
        overallFeedback: summary,
        verdict,
        completedAt: new Date(),
      },
    });

    return res.status(200).json({ success: true, interview: updated });
  } catch (error) {
    console.log("===== COMPLETE INTERVIEW ERROR =====", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate final report. Please try again.",
      error: error.message,
    });
  }
};

module.exports = {
  startInterview,
  getMyInterviews,
  getInterview,
  submitAnswer,
  completeInterview,
};