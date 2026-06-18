const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

// ── Cloudflare AI (Primary — truly free, no daily limits) ──
const cloudflareComplete = async (prompt, systemPrompt) => {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-70b-instruct`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    }
  );

  const data = await response.json();

  if (!data.success) {
    throw new Error(`Cloudflare AI error: ${JSON.stringify(data.errors)}`);
  }

  return data.result.response;
};

// ── Gemini (Fallback 1) ──
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const geminiComplete = async (prompt, systemPrompt) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: systemPrompt,
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

// ── Groq (Fallback 2) ──
const groqComplete = async (prompt, systemPrompt) => {
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

// ── Main — Cloudflare → Gemini → Groq ──
const aiComplete = async (prompt, systemPrompt) => {

  // Try Cloudflare first
  try {
    console.log("🤖 Using Cloudflare AI...");
    const response = await cloudflareComplete(prompt, systemPrompt);
    return response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
  } catch (error) {
    console.log("⚠️ Cloudflare failed:", error.message, "→ Trying Gemini...");
  }

  // Try Gemini
  try {
    console.log("🤖 Using Gemini...");
    const response = await geminiComplete(prompt, systemPrompt);
    return response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
  } catch (error) {
    console.log("⚠️ Gemini failed:", error.message, "→ Trying Groq...");
  }

  // Try Groq last
  try {
    console.log("🤖 Using Groq...");
    const response = await groqComplete(prompt, systemPrompt);
    return response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
  } catch (error) {
    console.log("⚠️ Groq failed:", error.message);
    if (error.status === 429) {
      throw new Error(
        "All AI services are busy. Please try again in a few minutes."
      );
    }
    throw error;
  }
};

module.exports = { aiComplete };