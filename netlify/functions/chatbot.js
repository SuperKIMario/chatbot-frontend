const fetch = require("node-fetch");

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
          { role: "system", content: "Du bist ein hilfreicher Assistent, der auf Deutsch antwortet." },
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
