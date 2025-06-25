// netlify/functions/chatbot.js

const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

exports.handler = async function (event) {
  try {
    const { message, history } = JSON.parse(event.body);

    // Hintergrundwissen laden
    const bgRaw = fs.readFileSync(
      path.join(__dirname, "backgroundInfo.json"),
      "utf8"
    );
    const bg = JSON.parse(bgRaw);

    // System-Prompt zusammenbauen
    const systemPrompt = `
Du bist SKIM, ein lockerer, humorvoller und professioneller Chatbot.
Du kennst Marios Profil:
${bg.profil}

Seine fachlichen Schwerpunkte:
${bg.schwerpunkte.join("\n")}

Soft Skills & Arbeitsweise:
${bg.softskills.join(", ")}

Beantworte kurz, prägnant, freundlich. Versuche, immer zum Buch-einen-Termin-CTA hinzuführen.
`;

    // Request an OpenAI
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: message },
        ],
      }),
    });
    const data = await openaiRes.json();

    // Safely extrahieren
    const answer =
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
        ? data.choices[0].message.content
        : "Entschuldigung, da ist etwas schiefgelaufen.";

    return {
      statusCode: 200,
      body: JSON.stringify({ answer }),
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        answer: "Fehler beim Serverkontakt. Bitte versuche es später erneut.",
      }),
    };
  }
};
