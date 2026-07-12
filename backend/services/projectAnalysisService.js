const { aiComplete } = require("../utils/geminiClient");

// ════════════════════════════════════════
// Reads the Projects section of a resume and produces a deep,
// per-project breakdown: what it actually covers, tech stack,
// strengths, missing elements, and suggested additions — plus
// overall project-portfolio suggestions.
// ════════════════════════════════════════

const analyzeProjects = async (resumeText) => {
  const systemPrompt =
    "You are a senior technical recruiter reviewing the Projects section of a resume. You are precise, only reference things actually stated or clearly implied in the resume, and never invent details. You output ONLY valid JSON, no markdown, no commentary.";

  const prompt = `
Read the resume text below and find its Projects section (or any project-like bullets under Experience).

Return ONLY this exact JSON structure, nothing before or after it:

{
  "projects": [
    {
      "name": "<project name as written in the resume>",
      "techStack": ["<technology 1>", "<technology 2>"],
      "whatItCovers": "<1-2 sentence plain-language summary of what this project actually does/solves>",
      "strengths": ["<specific strength 1 found in how it's described>", "<strength 2>"],
      "missingElements": ["<concrete thing missing from this project's description, e.g. no live link, no metrics, no testing mentioned>", "<second missing element>"],
      "suggestedAdditions": ["<specific, actionable addition to strengthen this project entry>", "<second suggestion>"]
    }
  ],
  "overallProjectSuggestions": [
    "<portfolio-level suggestion 1, e.g. add a project demonstrating system design>",
    "<suggestion 2>",
    "<suggestion 3>"
  ]
}

Rules:
- Only include projects that are actually present in the resume. Do not invent projects.
- If NO projects section or project-like bullets exist at all, return "projects": [] and make "overallProjectSuggestions" specifically about adding a projects section, with 3-4 concrete suggestions for what kind of projects to build given the candidate's apparent domain/skills.
- techStack: only list technologies explicitly mentioned for that specific project.
- whatItCovers must be grounded in the actual resume text — do not guess unstated functionality.
- Keep each string concise (under 25 words).

Resume text:
${resumeText}
`;

  const response = await aiComplete(prompt, systemPrompt);

  try {
    return JSON.parse(response);
  } catch (err) {
    return {
      projects: [],
      overallProjectSuggestions: [],
      parseError: true,
      message: "AI returned an unexpected format for project analysis.",
    };
  }
};

module.exports = { analyzeProjects };