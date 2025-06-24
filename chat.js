const chatLog = document.getElementById("chat-log");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

const history = [];

// Begrüßungsnachricht automatisch anzeigen
appendMessage("Fröhlichen guten Tag! Ich bin SKIM, dein digitaler Assistent. Was möchtest du über Mario wissen?", "bot");

function appendMessage(text, sender) {
  const div = document.createElement("div");
  div.className = "message " + sender;
  div.textContent = text;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

sendBtn.onclick = async () => {
  const message = input.value.trim();
  if (!message) return;

  appendMessage(message, "user");
  input.value = "";

  history.push({ role: "user", content: message });

  appendMessage("...", "bot");
  const loadingMessage = chatLog.querySelector(".bot:last-child");

  try {
    const response = await fetch("/.netlify/functions/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: message, history }),
    });

    const data = await response.json();

    chatLog.removeChild(loadingMessage);

    if (data.reply) {
      appendMessage(data.reply, "bot");
      history.push({ role: "assistant", content: data.reply });
    } else {
      appendMessage("Entschuldigung, da ist etwas schiefgelaufen.", "bot");
    }
  } catch (error) {
    chatLog.removeChild(loadingMessage);
    appendMessage("Fehler beim Serverkontakt. Bitte versuche es später erneut.", "bot");
  }
};
