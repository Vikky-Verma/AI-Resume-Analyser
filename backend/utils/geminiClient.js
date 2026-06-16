const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

// ── Gemini ──
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const geminiComplete = async (prompt, systemPrompt) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: systemPrompt,
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

// ── Groq fallback ──
const groqFallback = async (prompt, systemPrompt) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
    max_tokens: 2000,
  });
  return completion.choices[0].message.content;
};

// ── Main — Gemini first, Groq fallback ──
const aiComplete = async (prompt, systemPrompt) => {
  try {
    console.log("🤖 Using Gemini...");
    const response = await geminiComplete(prompt, systemPrompt);
    return response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
  } catch (error) {
    console.log("⚠️ Gemini failed:", error.message, "→ Switching to Groq...");
    try {
      const response = await groqFallback(prompt, systemPrompt);
      return response
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
    } catch (groqError) {
      if (groqError.status === 429) {
        throw new Error(
          "AI services are busy. Please try again in a few minutes."
        );
      }
      throw groqError;
    }
  }
};

module.exports = { aiComplete };