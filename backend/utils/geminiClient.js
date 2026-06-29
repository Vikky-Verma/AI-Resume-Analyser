// utils/geminiClient.js — Cloudflare AI only

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

  return data.result.response
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
};

const aiComplete = async (prompt, systemPrompt) => {
  console.log("🤖 Using Cloudflare AI...");
  try {
    return await cloudflareComplete(prompt, systemPrompt);
  } catch (error) {
    console.error("❌ Cloudflare AI failed:", error.message);
    throw new Error("AI service unavailable. Please try again later.");
  }
};

module.exports = { aiComplete };