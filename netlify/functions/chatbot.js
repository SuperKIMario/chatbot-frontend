const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

// 1) Hintergrund-Infos laden und in lesbaren Text wandeln
const raw = fs.readFileSync(path.join(__dirname, "../../backgroundInfo.json"), "utf-8");
const bg = JSON.parse(raw);
const infoText = [
  `Name: ${bg.person.name}`,
  `Rollen: ${bg.person.roles.join(", ")}`,
  `Positionierung: ${bg.person.positionierung}`,
  `Hard Skills: ${bg.hardSkills.join(", ")}`,
  `Soft Skills: ${bg.softSkills.join(", ")}`
].join("\n- ");
const bgPrompt = `Hintergrund zu Mario:\n- ${infoText}`;

exports.handler = async (event) => {
  try {
    const { prompt: userPrompt } = JSON.parse(event.body);
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ reply: "Serverkonfiguration fehlerhaft: API-Key fehlt." })
      };
    }

    const systemPrompt = `
Du bist SKIM, der persönliche digitale Assistent von Mario Wittmer.
Beantworte ausschließlich Fragen zu Mario, seinen Skills, Projekten und Angeboten.
Sprich locker-humorvoll, professionell und empathisch.
    `.trim();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-hi",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "system", content: bgPrompt },
          { role: "user",   content: userPrompt }
        ]
      })
    });

    const json = await response.json();
    const reply = json.choices?.[0]?.message?.content || 
                  "Entschuldigung, da ist etwas schiefgelaufen.";

    return {
      statusCode: response.ok ? 200 : 500,
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "Entschuldigung, da ist etwas schiefgelaufen." })
    };
  }
};
