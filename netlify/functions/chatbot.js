const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const body = JSON.parse(event.body);
  const prompt = body.prompt;

  const apiKey = process.env.OPENAI_API_KEY;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
    }),
  });

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify({ reply: data.choices[0].message.content })
  };
};
