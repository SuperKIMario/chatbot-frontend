const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  try {
    const body = JSON.parse(event.body);
    const prompt = body.prompt;
    const history = body.history || [];

    const apiKey = process.env.OPENAI_API_KEY;

    const systemPrompt = `
Du bist SKIM, ein lockerer, humorvoller und professioneller Chatbot.
Du kennst Marios Projekte, Skills und Persönlichkeit: Vertriebstraining, KI, Automatisierung,
Soft Skills, Baufinanzierung, Coaching, Content-Erstellung, Ehrenamt, Natur und mehr.
Sprich natürlich, empathisch, direkt mit Augenzwinkern, wenn es passt.
Antworte passend zum Kontext und bleibe immer hilfreich.
    `;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: prompt }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 400,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "OpenAI API Error" }),
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: data.choices[0].message.content }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
