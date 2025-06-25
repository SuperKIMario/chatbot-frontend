// netlify/functions/chatbot.js

const fetch = require("node-fetch");
const backgroundInfo = require("./backgroundInfo.js"); // <-- Dein Array-Modul
exports.handler = async function(event, context) {
  try {
    // 1) Incoming Request parsen
    const { message, history } = JSON.parse(event.body);
    console.log("▶️ User fragt:", message);

    // 2) Hintergrundwissen checken
    console.log(`✅ Hintergrundwissen geladen (${backgroundInfo.length} Einträge)`);
    
    // 3) System-Prompt inklusive Wissensdatenbank
    const systemPrompt = `
Du bist SKIM, Marios persönlicher digitaler Assistent.
Nutze folgendes Hintergrundwissen, wenn du antwortest:
${JSON.stringify(backgroundInfo, null, 2)}
    `.trim();

    // 4) Bisherigen Chat in OpenAI-Format mappen (bot→assistant)
    const mappedHistory = history.map(m => ({
      role: m.role === "bot" ? "assistant" : m.role,
      content: m.content
    }));

    // 5) Messages-Array bauen
    const messages = [
      { role: "system", content: systemPrompt },
      ...mappedHistory,
      { role: "user", content: message }
    ];
    console.log("📤 Sende an OpenAI:", messages);

    // 6) Anfrage an OpenAI
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
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Keine Antwort vom Modell");
    }

    // 7) Antwort zurückschicken
    const reply = data.choices[0].message.content;
    console.log("📥 Antwort von OpenAI:", reply);
    return {
      statusCode: 200,
      body: JSON.stringify({ answer: reply })
    };

  } catch (err) {
    console.error("❌ Handler Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
