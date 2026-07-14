const { aiComplete } = require("../utils/geminiClient");

const generateRoadmap = async (resumeText, targetRole, timeframeWeeks) => {
  const systemPrompt =
    "You are a career coach for ALL professional domains. You output ONLY valid JSON. No markdown. No explanation.";

  const prompt = `
You are an expert career coach who works across ALL professional domains —
software, electronics, mechanical, civil, medical, finance, law, management,
marketing, data science, education, HR, architecture, and every other field.

The candidate wants to become job-ready for a specific target role within a
specific timeframe. Read their resume, honestly assess their current gap to
that role, and build a REALISTIC, PHASED preparation plan broken into roughly
2-week blocks that adds up to the full timeframe.

Return ONLY valid JSON (no markdown, no explanation, no text before or after)
in exactly this format:

{
  "isResume": true,
  "currentLevel": "<their current level relative to the target role, e.g. 'Entry-level, missing 3 core skills'>",
  "readinessScore": <0-100 honest estimate of how ready they are for the target role RIGHT NOW, before this plan>,
  "phases": [
    {
      "title": "<e.g. 'Weeks 1-2: Close the Core Gap'>",
      "focus": "<one sentence: what this phase is really about>",
      "tasks": ["<specific, concrete task 1>", "<task 2>", "<task 3>", "<task 4>"],
      "milestone": "<one concrete, checkable thing they should be able to do/show by the end of this phase>"
    }
  ],
  "finalReadinessNote": "<one honest sentence on what 'job-ready' will realistically look like at the end of this plan if they follow it>"
}

Rules:
- The number of phases should roughly match ${timeframeWeeks} weeks in ~2-week blocks (so about ${Math.max(1, Math.round(timeframeWeeks / 2))} phases). Never pad with filler phases.
- readinessScore must be an honest, realistic number based on THEIR actual resume content vs. the target role — do not inflate it.
- tasks must be concrete and actionable (e.g. "Build a REST API with auth and deploy it" not "Learn backend development").
- Do NOT default to software/IT advice if the resume is from another domain.
- Do NOT recommend specific paid courses, bootcamps, or named platforms — describe what to learn/build, not where to buy it.
- Ground every phase in what's ACTUALLY missing from this specific resume for this specific target role — no generic advice.
- If the document is clearly NOT a resume (e.g. invoice, book, marksheet, essay), instead return ONLY:
{ "isResume": false, "message": "<one sentence explaining what it actually looks like instead>" }

Target Role: ${targetRole}
Timeframe: ${timeframeWeeks} weeks

Resume text:
${resumeText}
`;

  const response = await aiComplete(prompt, systemPrompt);

  try {
    return JSON.parse(response);
  } catch (err) {
    return {
      isResume: true,
      parseError: true,
      message: "AI returned an unexpected format. Please try again.",
      raw: response?.slice(0, 500),
    };
  }
};

module.exports = { generateRoadmap };
