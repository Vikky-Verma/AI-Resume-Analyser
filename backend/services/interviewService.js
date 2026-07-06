const { aiComplete } = require("../utils/geminiClient");

const cleanJson = (raw) => {
  if (typeof raw !== "string") return raw;
  return raw.replace(/```json/g, "").replace(/```/g, "").trim();
};

const generateQuestions = async (resumeText, company, role, level) => {
  const systemPrompt =
    "You are a senior technical interviewer and hiring panel lead who has conducted thousands of interviews at top companies. You output ONLY valid JSON. Never add markdown or explanation.";

  const prompt = `
You are designing a realistic mock interview for a candidate.

CANDIDATE CONTEXT:
- Target Company: ${company}
- Target Role: ${role}
- Experience Level: ${level}

Use the resume below to make questions personal — reference the candidate's
actual projects, skills, and experience wherever relevant instead of asking
generic questions.

════════════════════════════════════════
ROUND 1 — HR ROUND (5 questions)
════════════════════════════════════════
Behavioral / cultural-fit / motivation questions. Should reference the
candidate's actual background (career gaps, career switch, projects,
leadership, teamwork) where the resume supports it. Difficulty should match
"${level}" — a Fresher gets foundational HR questions (why this company, tell
me about yourself, strengths/weaknesses), an Advanced candidate gets deeper
behavioral/leadership/conflict-resolution questions.

════════════════════════════════════════
ROUND 2 — TECHNICAL ROUND (5 questions)
════════════════════════════════════════
Role and domain-specific technical questions based on the skills/tech stack
found in the resume and the target role "${role}". Mix conceptual questions
with "how would you design/approach X" questions. Difficulty must scale with
"${level}" (Fresher = fundamentals, Intermediate = applied/system-ish
questions, Advanced = architecture/trade-off/scale questions) and should feel
like what "${company}" would realistically ask for this role.

════════════════════════════════════════
ROUND 3 — DSA ROUND (5 questions)
════════════════════════════════════════
Data Structures & Algorithms problems appropriate for "${level}" difficulty
(Fresher = easy, Intermediate = easy-medium, Advanced = medium-hard). Give a
clear problem statement for each (candidate will answer with approach/pseudo
code/code as text, not run code). Cover a variety of topics (arrays/strings,
recursion, trees/graphs, DP, sorting/searching, etc.) rather than repeating
the same topic.

════════════════════════════════════════
Return ONLY this exact JSON. No markdown, no explanation, nothing before or after:

{
  "hr": ["<question 1>", "<question 2>", "<question 3>", "<question 4>", "<question 5>"],
  "technical": ["<question 1>", "<question 2>", "<question 3>", "<question 4>", "<question 5>"],
  "dsa": ["<question 1>", "<question 2>", "<question 3>", "<question 4>", "<question 5>"]
}

Resume:
${resumeText}
`;

  const raw = await aiComplete(prompt, systemPrompt);
  const parsed = JSON.parse(cleanJson(raw));

  if (
    !Array.isArray(parsed.hr) ||
    !Array.isArray(parsed.technical) ||
    !Array.isArray(parsed.dsa)
  ) {
    throw new Error("AI did not return valid round questions");
  }

  return parsed;
};

const scoreAnswer = async (roundType, question, answer, { company, role, level }) => {
  if (!answer || !answer.trim()) {
    return {
      score: 0,
      feedback:
        "No answer was given. Try to always attempt an answer, even a partial one — interviewers penalize silence more than an imperfect answer.",
    };
  }

  const systemPrompt =
    "You are a strict, fair technical/HR interviewer scoring a single interview answer. You output ONLY valid JSON. Never inflate scores. Never add markdown or explanation.";

  const roundContext = {
    HR: "This is an HR/behavioral round answer. Judge clarity, honesty, self-awareness, communication, and cultural fit.",
    TECHNICAL:
      "This is a technical round answer. Judge correctness, depth, and whether the candidate demonstrates real understanding vs surface-level buzzwords.",
    DSA: "This is a DSA round answer. Judge correctness of approach, time/space complexity awareness, and edge-case handling. The candidate answered in text (pseudocode/code/approach), not a compiler — judge the reasoning.",
  };

  const prompt = `
Company: ${company}
Role: ${role}
Candidate Level: ${level}
Round: ${roundType}

${roundContext[roundType] || ""}

Question:
${question}

Candidate's Answer:
${answer}

Score this ONE answer on a 0-10 scale (never round numbers like exactly 5 or
10 unless truly deserved — be precise, e.g. 6, 7.5, 3). Be strict and
realistic, matching the bar for "${level}" level at a company like "${company}".

Return ONLY this exact JSON. No markdown, no explanation:
{
  "score": <0-10 number>,
  "feedback": "<2-3 sentences: what was good, what was missing or wrong, and one concrete tip to improve this specific answer>"
}
`;

  const raw = await aiComplete(prompt, systemPrompt);
  const parsed = JSON.parse(cleanJson(raw));

  return {
    score: Number(parsed.score) || 0,
    feedback: parsed.feedback || "",
  };
};

const generateOverallFeedback = async (rounds, { company, role, level }) => {
  const systemPrompt =
    "You are a hiring panel lead writing a final interview debrief. You output ONLY valid JSON. Never add markdown or explanation.";

  const roundSummary = rounds
    .map(
      (r) =>
        `${r.label} — Score: ${r.score ?? "N/A"}/10\n` +
        r.questions
          .map(
            (q, i) =>
              `  Q${i + 1}: ${q.question}\n  Answer: ${q.answer || "(no answer)"}\n  Score: ${q.score ?? "N/A"}/10`
          )
          .join("\n")
    )
    .join("\n\n");

  const prompt = `
Candidate interviewed for: ${role} at ${company} (Level: ${level})

Full interview transcript with per-question scores:

${roundSummary}

Write a final hiring debrief. Return ONLY this exact JSON, no markdown, no explanation:
{
  "verdict": "<one of: Strong Hire, Hire, Leaning No Hire, No Hire>",
  "summary": "<4-6 sentence honest overall feedback covering strengths, weaknesses, and the clearest area to improve before the real interview>"
}
`;

  const raw = await aiComplete(prompt, systemPrompt);
  const parsed = JSON.parse(cleanJson(raw));

  return {
    verdict: parsed.verdict || "Hire",
    summary: parsed.summary || "",
  };
};

module.exports = { generateQuestions, scoreAnswer, generateOverallFeedback };