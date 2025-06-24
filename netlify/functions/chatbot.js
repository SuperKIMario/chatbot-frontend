const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

// Hintergrund-Infos laden
const bgInfo = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../backgroundInfo.json"), "utf-8")
);
const bgPrompt = `Hintergrundinfos zu Mario Wittmer:\n${JSON.stringify(bgInfo)}`;

exports.handler = async (event) => {
  try {
    const { prompt } = JSON.parse(event.body);
    const apiKey = process.env.OPENAI_API_KEY;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          // 1) System-Prompt mit Stil und Regeln
          {
            role: "system",
            content: "Du bist SKIM, der persönliche digitale Assistent von Mario Wittmer. Beantworte nur Fragen zu Mario, seinen Skills, Projekten und Angeboten. Bleibe locker-humorvoll, professionell, empathisch und lösungsorientiert. Verweise bei komplexen juristischen oder medizinischen Fragen auf Experten."
          },
          // 2) Hintergrund-Info
          { role: "system", content: bgPrompt },
          // 3) Nutzer-Anfrage
          { role: "user", content: prompt }
        ]
      })
    });

    const json = await res.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ reply: json.choices[0].message.content })
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};
