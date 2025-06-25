// netlify/functions/chatbot.js

const fetch = require("node-fetch");
const bg = require("./backgroundInfo.js");

exports.handler = async function(event) {
  try {
    // 1) Input parsen
    const { message, history } = JSON.parse(event.body);

    // 2) System-Prompt aus backgroundInfo zusammenbauen
    const systemPrompt = `
Du bist SKIM, ein lockerer, humorvoller und professioneller Chatbot.
Name: ${bg.profil.name}
Rolle: ${bg.profil.rolle}
Positionierung: ${bg.profil.positionierung}
`.trim();

    // 3) Request an OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          // vorhandene Historie mitnehmen
          ...history,
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) throw new Error("Keine Antwort vom Modell");

    return {
      statusCode: 200,
      body: JSON.stringify({ answer: reply })
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        answer: "Fehler beim Serverkontakt. Bitte versuche es später erneut."
      })
    };
  }
};
