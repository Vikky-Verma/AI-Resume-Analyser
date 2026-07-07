const { aiComplete } = require("../utils/geminiClient");

// ════════════════════════════════════════
// FAST LOCAL CHECK — catches obvious non-resumes
// before we spend an AI call on them
// ════════════════════════════════════════
const looksLikeResume = (text) => {
  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount < 30) return false;

  const resumeSignals = [
    /\b(work experience|professional experience|employment history)\b/i,
    /\b(education|academic background|qualifications)\b/i,
    /\b(skills|technical skills|core competencies)\b/i,
    /\b(projects|personal projects|academic projects)\b/i,
    /\b(internship|intern at|interned at)\b/i,
    /\b(objective|summary|profile|about me)\b/i,
    /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/,
    /\b(linkedin\.com|github\.com|portfolio)\b/i,
  ];

  return resumeSignals.filter((p) => p.test(text)).length >= 2;
};

// ════════════════════════════════════════
// MAIN — Generates the full ATS Evaluation report.
// This now folds in EVERYTHING the separate "Resume Analysis"
// and "Career Recommendation" features used to produce
// (score, domain, skills, missing skills, suggestions, best fit
// role, recommended roles, skills to learn, roadmap) PLUS the
// RoundOne-style sections (verdict, best role match %, critical
// issues, category breakdown, line-by-line fixes, missing keywords)
// — all from a single AI call.
// ════════════════════════════════════════
const generateATSReport = async (resumeText, targetRole, experienceLevel) => {
  if (!looksLikeResume(resumeText)) {
    return {
      isResume: false,
      message:
        "This doesn't look like a resume. Please upload a valid resume (PDF/DOCX) and try again.",
    };
  }

  const systemPrompt =
    "You are RoundOne's brutal, FAANG-level ATS + career evaluation engine. You score resumes harshly and honestly, like a senior recruiter who has read 10,000 resumes, across ALL professional domains (not just tech). You output ONLY valid JSON. Never add markdown, backticks, or explanation outside the JSON.";

  const prompt = `
You are evaluating a candidate's resume for the role of "${targetRole || "the role they are targeting"}" at experience level "${experienceLevel || "Fresher"}".

Analyze the resume below and return ONLY this exact JSON structure, nothing before or after it:

{
  "isResume": true,
  "domain": "<detected professional domain, e.g. Software Engineering, Finance, Mechanical Engineering>",
  "detectedExperienceLevel": "<Fresher/Junior/Mid-Level/Senior/Expert based on the resume itself>",
  "atsScore": <0-100 integer, strict, do not inflate>,
  "resumeScore": <0-100 integer, overall resume quality score across impact, structure, completeness, keywords, narrative>,
  "verdict": "<one of: STRONG HIRE, HIRE, LEAN HIRE, NO HIRE — based strictly on atsScore: 85+ STRONG HIRE, 70-84 HIRE, 50-69 LEAN HIRE, below 50 NO HIRE>",

  "skillsFound": ["<real skill 1 actually present in the resume>", "<skill 2>"],
  "missingSkills": ["<6-8 high-demand skills missing for this domain/role>"],
  "suggestions": [
    "<suggestion 1 referencing a SPECIFIC section of THIS resume with an example rewrite>",
    "<suggestion 2>",
    "<suggestion 3>",
    "<suggestion 4>",
    "<suggestion 5>"
  ],

  "bestFitRole": "<single best specific role for this candidate right now>",
  "recommendedRoles": ["<role 1>", "<role 2>", "<role 3>", "<role 4>", "<role 5>"],
  "skillsToLearn": ["<specific missing high-demand skill 1>", "<skill 2>", "<skill 3>", "<skill 4>", "<skill 5>"],
  "careerRoadmap": [
    "<Step 1: specific actionable career step>",
    "<Step 2>",
    "<Step 3>",
    "<Step 4>",
    "<Step 5>"
  ],

  "bestRoleMatches": [
    { "role": "<realistic adjacent/related role 1>", "matchPercent": <0-100> },
    { "role": "<role 2>", "matchPercent": <0-100> },
    { "role": "<role 3>", "matchPercent": <0-100> },
    { "role": "<role 4>", "matchPercent": <0-100> }
  ],
  "criticalIssues": [
    "<the single biggest structural or credibility issue with this resume, one sharp sentence>",
    "<second biggest issue, one sharp sentence>"
  ],
  "categoryBreakdown": [
    { "category": "Impact And Metrics", "score": <0-10>, "note": "<one short sentence justifying the score, reference resume specifics>" },
    { "category": "Action Verbs", "score": <0-10>, "note": "<one short sentence>" },
    { "category": "Technical Depth", "score": <0-10>, "note": "<one short sentence>" },
    { "category": "Brevity And Clarity", "score": <0-10>, "note": "<one short sentence>" },
    { "category": "ATS Parsability", "score": <0-10>, "note": "<one short sentence>" }
  ],
  "lineByLineFixes": [
    {
      "reasoning": "<one italic-style sentence explaining WHY this line needs to change>",
      "original": "<verbatim or near-verbatim weak bullet line copied from the resume>",
      "rewrite": "<a stronger, quantified, action-verb-led rewrite of that same bullet>"
    }
  ],
  "missingKeywords": ["<5-8 high-value ATS keywords missing for this target role>"]
}

Rules:
- domain: do NOT default to software/IT if the resume is from another field.
- skillsFound: only real skills genuinely present in the resume text.
- missingSkills vs skillsToLearn vs missingKeywords: these can overlap, but each list should still be filled in independently and thoughtfully for its own section.
- bestRoleMatches: rank roles by realistic fit given the candidate's actual background.
- criticalIssues: only include REAL issues found in this specific resume — be specific, not generic.
- lineByLineFixes: include exactly 3 fixes, pulled from real bullets in the resume (projects/experience section). Never invent content not implied by the resume.
- Never round atsScore or resumeScore to a multiple of 5 or 10 — use realistic numbers like 47, 63, 86.
- If the document is clearly NOT a resume (e.g. invoice, book, marksheet, essay), instead return ONLY:
{ "isResume": false, "message": "<one sentence explaining what it actually looks like instead>" }

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

module.exports = { generateATSReport };