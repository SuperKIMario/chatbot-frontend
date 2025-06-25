// netlify/functions/chatbot.js
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

exports.handler = async function(event) {
  try {
    const { message, history } = JSON.parse(event.body);

    // Hintergrundwissen laden
    const bg = JSON.parse(
      fs.readFileSync(path.join(__dirname, "backgroundInfo.json"), "utf8")
    );

    // System-Prompt + Wissensdatenbank
    const systemPrompt = `
Du bist SKIM, Marios persönlicher digitaler Assistent.
Nutze folgendes Hintergrundwissen, wenn du antwortest:
${JSON.stringify(bg, null, 2)}
`;

    // History mappen: "bot" → "assistant"
    const mapped = history.map(m => ({
      role: m.role === "bot" ? "assistant" : m.role,
      content: m.content
    }));

    // Nachrichten-Array für OpenAI
    const messages = [
      { role: "system", content: systemPrompt },
      ...mapped,
      { role: "user", content: message }
    ];

    // Request an OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) throw new Error("Keine Antwort vom Modell");

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    console.error("Handler Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "Entschuldigung, da ist etwas schiefgelaufen." })
    };
  }
};
