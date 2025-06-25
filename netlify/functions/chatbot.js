// netlify/functions/chatbot.js

- const fs = require("fs");
- const path = require("path");
+ // wir brauchen weder fs noch path mehr

exports.handler = async function(event) {
  try {
    const { message, history } = JSON.parse(event.body);

-   // Hintergrundwissen laden (funktioniert nicht sauber bei Netlify-Bundling)
-   const bg = JSON.parse(
-     fs.readFileSync(path.join(__dirname, "backgroundInfo.json"), "utf8")
-   );
+   // Hintergrundwissen importieren
+   const bg = require("./backgroundInfo.js");

    // System-Prompt
    const systemPrompt = `
Du bist SKIM, ein lockerer, humorvoller und professioneller Chatbot.
Du kennst Marios Profil:
Name: ${bg.profil.name}
Rolle: ${bg.profil.rolle}
...
    `.trim();

    // OpenAI-Request ­… (bleibt unverändert)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) throw new Error("No reply from OpenAI");

    return {
      statusCode: 200,
      body: JSON.stringify({ answer: reply }),
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ answer: "Fehler beim Serverkontakt. Bitte versuche es später erneut." }),
    };
  }
};
