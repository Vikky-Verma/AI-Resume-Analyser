const { aiComplete } = require("../utils/geminiClient");

const detectResume = async (resumeText) => {
  const prompt = `
Analyze this text and determine if it is a resume/CV or not.

A resume/CV typically contains AT LEAST 3 of these:
- Person's name and contact information (email, phone)
- Work experience or internships
- Education section (degree, institution)
- Skills section
- Projects section
- Professional summary or objective

Text to analyze:
${resumeText.slice(0, 1000)}

Return ONLY this exact JSON. No markdown. No explanation:
{
  "isResume": true or false,
  "confidence": "high/medium/low",
  "reason": "<one line reason if not a resume>"
}
`;

  const systemPrompt =
    "You are a document classifier. You only output valid JSON. Never add markdown or explanation.";

  const result = await aiComplete(prompt, systemPrompt);

  try {
    const cleaned = result.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return { isResume: true, confidence: "low", reason: "" };
  }
};

const analyzeResume = async (resumeText) => {
  // Step 1 — Check if it is actually a resume
  const detection = await detectResume(resumeText);

  if (!detection.isResume) {
    return {
      isResume: false,
      message:
        detection.reason ||
        "The uploaded PDF does not appear to be a resume or CV. Please upload a valid resume.",
    };
  }

  // Step 2 — Check minimum content
  if (resumeText.trim().split(" ").length < 50) {
    return {
      isResume: false,
      message:
        "The PDF appears to be empty or has very little text. Please upload a text-based resume (not a scanned image).",
    };
  }

  // Step 3 — Full analysis
  const systemPrompt =
    "You are a strict ATS scoring machine that works across ALL professional domains. You score resumes objectively and harshly based on domain-specific standards. You output ONLY valid JSON. Never inflate scores. Never add markdown or explanation.";

  const prompt = `
You are the world's most strict and accurate ATS Resume Scoring Engine used by top recruiting firms across ALL industries — tech, electronics, medical, finance, law, management, civil engineering, marketing, education, and every other field.

You score resumes objectively and harshly. You are NOT a career coach. You are a MACHINE.

════════════════════════════════════════
STEP 1 — DETECT DOMAIN
════════════════════════════════════════
First, detect the candidate's professional domain from resume content.
Examples: Software Engineering, Electronics/Embedded, Mechanical Engineering,
Civil Engineering, Medical/Healthcare, Finance/Accounting, Management/MBA,
Marketing/Sales, Data Science, Legal, Architecture, Education, Pharmacy, HR, etc.

════════════════════════════════════════
STEP 2 — ATS SCORE (0–100)
════════════════════════════════════════
Start at 100. Deduct points for issues found.

CRITICAL DEDUCTIONS (–15 to –25 each):
□ No quantified achievements (no numbers, metrics, percentages) → –25
□ Missing contact info (email, phone) → –20
□ No portfolio/GitHub for tech roles OR no LinkedIn for management/business roles → –18
□ Skills section has fewer than 8 domain-relevant skills → –15
□ Vague bullet points ("worked on", "helped with", "responsible for") → –20
□ No professional summary or objective → –15
□ Fewer than 2 real projects or experiences with details → –18

MAJOR DEDUCTIONS (–8 to –14 each):
□ No team size, project scale, or business impact mentioned → –12
□ Missing education details (degree, institution, year) → –10
□ No certifications or continuous learning shown → –8
□ Tools/technologies mentioned without context of usage → –10
□ No action verbs (built, designed, led, optimized, managed, analyzed) → –8
□ Generic summary ("hardworking team player", "passionate professional") → –10
□ No real-world deployment or production usage of work → –12

MODERATE DEDUCTIONS (–3 to –7 each):
□ No community involvement or extracurriculars → –5
□ Skills listed without context → –4
□ Missing GPA or relevant coursework for freshers → –3
□ No awards or recognition → –4
□ Projects have no links or references → –6
□ Inconsistent date formatting → –3
□ Missing industry-specific keywords → –7

ABSOLUTE RULES:
1. Zero quantified achievements → ATS score CANNOT exceed 55
2. Missing portfolio/profile link for professional role → CANNOT exceed 62
3. Fewer than 3 complete experience/project entries → CANNOT exceed 50
4. No professional summary → deduct minimum 15 from both scores
5. Fresher with no internship/projects → both scores MUST be under 45
6. Resume under 200 words → both scores MUST be under 35
7. NEVER give round numbers (not 50, 60, 70) — use 47, 63, 71 etc.
8. NEVER inflate scores. Score like a machine, not a coach.
9. Both scores INDEPENDENTLY calculated — can differ by up to 20 points

════════════════════════════════════════
STEP 3 — RESUME SCORE (0–100)
════════════════════════════════════════
Score across 6 dimensions based on detected domain standards:

1. IMPACT & ACHIEVEMENTS (0–25 pts)
2. DOMAIN DEPTH & RELEVANCE (0–20 pts)
3. STRUCTURE & READABILITY (0–15 pts)
4. COMPLETENESS (0–15 pts)
5. KEYWORD OPTIMIZATION (0–15 pts)
6. CAREER NARRATIVE (0–10 pts)

════════════════════════════════════════
STEP 4 — DOMAIN-SPECIFIC MISSING SKILLS
════════════════════════════════════════
Based on detected domain, list 6–8 HIGH-DEMAND missing skills for 2024–2025.

════════════════════════════════════════
STEP 5 — SUGGESTIONS
════════════════════════════════════════
Give exactly 5 suggestions. Each MUST reference a SPECIFIC section or bullet
from THIS resume with an example rewrite.

════════════════════════════════════════

Return ONLY this exact JSON. No markdown. No explanation. Nothing before or after:

{
  "isResume": true,
  "domain": "<detected professional domain>",
  "experienceLevel": "<Fresher/Junior/Mid-Level/Senior/Expert>",
  "score": <resume score — realistic, never rounded>,
  "atsScore": <ATS score — realistic, never rounded>,
  "skills": [<every domain-relevant skill, tool, certification found in resume>],
  "missingSkills": [<6-8 specific high-demand missing skills for their detected domain>],
  "suggestions": [
    "<specific suggestion 1 referencing actual resume content with example rewrite>",
    "<specific suggestion 2>",
    "<specific suggestion 3>",
    "<specific suggestion 4>",
    "<specific suggestion 5>"
  ]
}

Resume to analyze:
${resumeText}
`;

  return await aiComplete(prompt, systemPrompt);
};

module.exports = analyzeResume;