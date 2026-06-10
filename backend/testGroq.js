require("dotenv").config();

const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function main() {
  const chatCompletion =
    await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "Say Hello",
        },
      ],
      model: "llama-3.1-8b-instant",
    });

  console.log(
    chatCompletion.choices[0].message.content
  );
}

main();