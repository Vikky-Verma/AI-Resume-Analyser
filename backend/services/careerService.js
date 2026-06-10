const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const generateCareerAdvice = async (resumeText) => {
  const prompt = `
You are an expert tech career advisor.

Analyze the resume and return ONLY valid JSON (no markdown, no explanation).

Format:
{
  "bestFitRole": "",
  "recommendedRoles": [],
  "skillsAlreadyHave": [],
  "skillsToLearn": [],
  "roadmap": []
}

Rules:
- bestFitRole must be ONE role only
- recommendedRoles: 5 roles max
- skillsAlreadyHave: extract real technical skills from resume
- skillsToLearn: 5 missing high-demand skills
- roadmap: 5 step career learning plan
- Focus only on IT/tech roles

Resume:
${resumeText}
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  return response.choices[0].message.content;
};

const matchJobDescription = async (resumeText, jobDescription) => {
  const prompt = `
You are an expert tech recruiter and career advisor.

Compare this resume against the job description and return ONLY valid JSON (no markdown, no explanation).

Format:
{
  "matchScore": 0,
  "matchedSkills": [],
  "missingSkills": [],
  "suggestions": []
}

Rules:
- matchScore: number from 0 to 100 based on how well resume fits the job
- matchedSkills: skills present in both resume and job description
- missingSkills: skills required by job but missing in resume
- suggestions: 5 actionable tips to improve resume for this specific job

Resume:
${resumeText}

Job Description:
${jobDescription}
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  return response.choices[0].message.content;
};

module.exports = { generateCareerAdvice, matchJobDescription };