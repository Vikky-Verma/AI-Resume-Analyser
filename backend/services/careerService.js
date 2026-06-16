const { aiComplete } = require("../utils/geminiClient");

const generateCareerAdvice = async (resumeText) => {
  const systemPrompt =
    "You are a career advisor for ALL professional domains, not just tech. You output ONLY valid JSON. No markdown. No explanation.";

  const prompt = `
You are an expert career advisor who works across ALL professional domains —
software, electronics, mechanical, civil, medical, finance, law, management,
marketing, data science, education, HR, architecture, and every other field.

Analyze this resume, detect the professional domain, and return ONLY valid JSON
(no markdown, no explanation, no text before or after).

Return exactly this format:
{
  "domain": "<detected professional domain>",
  "bestFitRole": "<single best role for this candidate right now>",
  "recommendedRoles": ["<role 1>", "<role 2>", "<role 3>", "<role 4>", "<role 5>"],
  "skillsAlreadyHave": ["<real skill from resume>"],
  "skillsToLearn": ["<specific missing high-demand skill 1>", "<skill 2>", "<skill 3>", "<skill 4>", "<skill 5>"],
  "roadmap": [
    "<Step 1: specific actionable career step>",
    "<Step 2>",
    "<Step 3>",
    "<Step 4>",
    "<Step 5>"
  ]
}

Rules:
- bestFitRole: ONE specific role matching their current level and domain
- recommendedRoles: 5 realistic roles for their domain and experience level
- skillsAlreadyHave: extract REAL skills mentioned in resume only
- skillsToLearn: domain-specific high-demand skills missing from resume
- roadmap: 5 practical steps tailored to their domain career path
- DO NOT default to IT/software roles if the resume is from another domain

Resume:
${resumeText}
`;

  return await aiComplete(prompt, systemPrompt);
};

const matchJobDescription = async (resumeText, jobDescription) => {
  const systemPrompt =
    "You are a recruiter for ALL professional industries. You output ONLY valid JSON. No markdown. No explanation.";

  const prompt = `
You are an expert recruiter and career advisor who works across ALL industries.

Compare this resume against the job description and return ONLY valid JSON
(no markdown, no explanation).

Return exactly this format:
{
  "matchScore": <0-100 based on how well resume fits the job>,
  "matchedSkills": ["<skill present in both resume and JD>"],
  "missingSkills": ["<skill required by JD but missing in resume>"],
  "suggestions": [
    "<specific tip 1 to improve resume for this exact job>",
    "<specific tip 2>",
    "<specific tip 3>",
    "<specific tip 4>",
    "<specific tip 5>"
  ]
}

Rules:
- matchScore: honest score — do NOT inflate
- matchedSkills: only skills genuinely in both resume AND job description
- missingSkills: skills the JD requires that are absent from resume
- suggestions: domain-appropriate, reference actual resume content where possible
- Works for ANY industry

Resume:
${resumeText}

Job Description:
${jobDescription}
`;

  return await aiComplete(prompt, systemPrompt);
};

module.exports = { generateCareerAdvice, matchJobDescription };