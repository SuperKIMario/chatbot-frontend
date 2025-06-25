const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

exports.handler = async function (event) {
  try {
    const { message, history } = JSON.parse(event.body);

    // Hintergrundwissen laden
    const bg = JSON.parse(
      fs.readFileSync(path.join(__dirname, "backgroundInfo.json"), "utf8")
    );

    // System-Prompt
    const systemPrompt = `
Du bist SKIM, ein lockerer, humorvoller und professioneller Chatbot.
Du kennst Marios Profile:
${bg["👤 Profil"].Rolle}: ${bg["👤 Profil"].Positionierung}.
Fachliche Schwerpunkte: ${bg["📊 Fachliche Schwerpunkte"].join(", ")}.
Soft Skills: ${bg["🌟 Soft Skills & Arbeitsweise"].join(", ")}.
Antworte natürlich, empathisch, zielfokussiert. Vermeide Gehaltsangaben und Buzzwords.
    `;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []),
      { role: "user", content: message },
    ];

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // oder dein bevorzugtes Modell
        messages,
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    if (!resp.ok) {
      throw new Error(`OpenAI Error ${resp.status}`);
    }

    const data = await resp.json();
    const answer = data.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ answer }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
