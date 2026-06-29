// testCloudflare.js
require("dotenv").config();

async function main() {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-70b-instruct`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Say Hello" }],
        max_tokens: 50,
      }),
    }
  );

  const data = await response.json();

  if (!data.success) {
    console.error("❌ Failed:", data.errors);
    return;
  }

  console.log("✅ Cloudflare AI works!");
  console.log("Response:", data.result.response);
}

main();