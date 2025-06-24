const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

// 1) Hintergrund-Infos laden
let bgInfo;
try {
  bgInfo = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../backgroundInfo.json"), "utf-8")
  );
} catch (err) {
  console.error("❌ Fehler beim Laden von backgroundInfo.json:", err);
}

const bgPrompt = `Hintergrundinfos zu Mario Wittmer:\n${JSON.stringify(bgInfo)}`;

exports.handler = async (event, context) => {
  console.log("➡️ Aufruf chatbot.js, body:", event.body);

  let userPrompt;
  try {
    ({ prompt: userPrompt } = JSON.parse(event.body));
  } catch (err) {
    console.error("❌ JSON.parse Fehler:", err);
    return {
      statusCode: 400,
      body: JSON.stringify({ reply: "Ungültige Anfrage (JSON fehlerhaft)." })
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  console.log("🔑 OPENAI_API_KEY vorhanden?", Boolean(apiKey));

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "Serverkonfiguration fehlerhaft: API-Key fehlt." })
    };
  }

  // 2) System-Prompt
  const systemPrompt = `Du bist SKIM, der persönliche digitale Assistent von Mario Wittmer. Beantworte nur...
  `; // kürze hier deinen System-Prompt

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "system", content: bgPrompt },
          { role: "user",   content: userPrompt }
        ]
      })
    });

    console.log("📶 OpenAI-Status:", response.status);
    const json = await response.json();
    console.log("💬 OpenAI-Antwort:", json);

    if (!response.ok) {
      throw new Error(`OpenAI Fehler: ${response.status}`);
    }

    const reply = json.choices?.[0]?.message?.content;
    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    console.error("❌ Fehler in handler:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "Entschuldigung, da ist etwas schiefgelaufen." })
    };
  }
};
