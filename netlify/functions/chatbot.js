// netlify/functions/chatbot.js
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  try {
    // 1) Request body auslesen
    const { message, history } = JSON.parse(event.body);

    // 2) Hintergrundwissen laden
    const infoPath = path.join(__dirname, "backgroundInfo.json");
    const backgroundInfo = JSON.parse(fs.readFileSync(infoPath, "utf8"));

    console.log("Loaded backgroundInfo.json:", Object.keys(backgroundInfo));

    // 3) System-Prompt bauen
    const systemPrompt = `
Du bist SKIM, Marios persönlicher digitaler Assistent.
Name: ${backgroundInfo.name}
Tagline: ${backgroundInfo.tagline}
Rollen: ${backgroundInfo.roles.join(", ")}
Skills: ${backgroundInfo.skills.join(", ")}
Soft Skills: ${backgroundInfo.softSkills.join(", ")}
Projekte: ${backgroundInfo.projects.join(", ")}

Sprich freundlich, direkt und professionell.
    `.trim();

    // 4) Nachrichten-Array
    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []),
      { role: "user", content: message }
    ];

    // 5) Call OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 400,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.error("OpenAI API ERROR", await response.text());
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "OpenAI API Error" })
      };
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ answer })
    };

  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
