const fetch = require("node-fetch");

exports.handler = async function(event) {
  try {
    const { prompt } = JSON.parse(event.body);

    // Dein System-Prompt + Hintergrundwissen hier inline:
    const systemPrompt = `
Du bist SKIM, Marios persönlicher digitaler Assistent.
Nutze dein Hintergrundwissen, um Fragen präzise zu beantworten:
- Name: Mario Wittmer
- Rolle: Vertriebsstratege | Coach | KI-gestützter Systemdenker
- Positionierung: Operativ. Strategisch. Automatisiert.
- Schwerpunkte: B2B-Vertrieb, Kaltakquise, Lead-Generierung, Coaching, KI-Automatisierung, Funnel-Design
- Soft-Skills: klar, empathisch, lösungsorientiert, systemisch denkend
    `.trim();

    // Request an OpenAI
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await openaiRes.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Keine Antwort vom Modell");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: data.choices[0].message.content })
    };
  } catch(err) {
    console.error("Handler Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
