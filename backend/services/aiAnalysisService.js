const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const analyzeResume = async (resumeText) => {
  const prompt = `
You are an ATS Resume Analyzer.

Analyze this resume.

Return ONLY valid JSON.

{
  "score": 0,
  "atsScore": 0,
  "skills": [],
  "missingSkills": [],
  "suggestions": []
}

Rules:
- score must be between 0 and 100
- atsScore must be between 0 and 100
- Extract all technical skills
- For a Full Stack Developer role suggest missing skills like:
  AWS,
  Kubernetes,
  Redis,
  CI/CD,
  Terraform,
  Microservices
- Give exactly 5 improvement suggestions
- Return ONLY JSON
- No explanation
- No markdown

Resume:

${resumeText}
`;

  const completion =
    await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
    });

  return completion.choices[0].message.content;
};

module.exports = analyzeResume;