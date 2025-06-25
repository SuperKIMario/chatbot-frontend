const fetch = require("node-fetch");
const backgroundInfo = require("./backgroundInfo.json");

exports.handler = async function(event, context) {
  try {
    const { message, history } = JSON.parse(event.body);

    const systemPrompt = `
Du bist SKIM, ein lockerer, humorvoller und professioneller Chatbot.
Du kennst Marios Profil:
${backgroundInfo.profile.name} – ${backgroundInfo.profile.role}
Tagline: ${backgroundInfo.profile.tagline}

Fachliche Schwerpunkte:
${backgroundInfo.focus.map((f,i) => `${i+1}. ${f}`).join("\n")}

Sprachstil:
${backgroundInfo.style.tone}
Dos: ${backgroundInfo.style.dos.join(", ")}
Don'ts: ${backgroundInfo.style.donts.join(", ")}
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []),
      { role: "user", content: message }
    ];

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7
      })
    });

    const data = await res.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ answer: data.choices[0].message.content })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ answer: "Entschuldigung, da ist etwas schiefgelaufen." })
    };
  }
};
