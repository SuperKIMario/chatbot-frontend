const fetch = require("node-fetch");

// Einfache In-Memory-Rate-Limit-Tabelle (IP-basiert)
const calls = {};

exports.handler = async function(event) {
  try {
    // 1) Rate-Limit auslesen
    const ip = event.headers['x-nf-client-connection-ip']
             || event.headers['x-forwarded-for']
             || event.headers['client-ip']
             || 'unknown';
    const now = Date.now();
    if (!calls[ip] || now - calls[ip].reset > 24 * 3600 * 1000) {
      // Reset nach 24 Stunden
      calls[ip] = { count: 0, reset: now };
    }
    if (calls[ip].count >= 5) {
      // Limit erreicht → eigene Nachricht zurückliefern
      return {
        statusCode: 429,
        body: JSON.stringify({
          reply: "Vielen Dank für deine Fragen. Möchtest du noch mehr wissen? Dann buch dir jetzt direkt über mariowittmer.de deinen persönlichen Termin ein. Ich wünsche euch einen bereichernden Austausch."
        })
      };
    }
    calls[ip].count++;

    // 2) Payload parsen
    const { prompt } = JSON.parse(event.body);

    // 3) System-Prompt (Hintergrundinfos)
    const systemPrompt = `
Du bist SKIM, Marios persönlicher digitaler Assistent.
Nutze dein Hintergrundwissen, um Fragen präzise zu beantworten:
- Name: Mario Wittmer
- Rolle: Vertriebsstratege | Coach | KI-gestützter Systemdenker
- Positionierung: Operativ. Strategisch. Automatisiert.
- Schwerpunkte: B2B-Vertrieb, Kaltakquise, Lead-Generierung, Coaching, KI-Automatisierung, Funnel-Design
- Soft-Skills: klar, empathisch, lösungsorientiert, systemisch denkend
    `.trim();

    // 4) Anfrage an OpenAI
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
          { role: "user",   content: prompt }
        ]
      })
    });

    const data = await openaiRes.json();
    if (!data.choices?.[0]?.message) {
      throw new Error("Keine Antwort vom Modell");
    }

    // 5) Antwort zurückgeben
    return {
      statusCode: 200,
      body: JSON.stringify({ reply: data.choices[0].message.content })
    };

  } catch (err) {
    console.error("Handler Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
