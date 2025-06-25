// chat.js
const chat = document.getElementById("chat");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

const history = [];

// Begrüßung einmal anzeigen
appendMessage("Fröhlichen guten Tag. Ich bin SKIM. Möchtest du mehr über Mario erfahren?", "bot-greet");

sendBtn.onclick = async () => {
  const text = input.value.trim();
  if (!text) return;
  // User-Message
  appendMessage(text, "user");
  history.push({ role: "user", content: text });
  input.value = "";
  // Lade-Indicator
  appendMessage("…", "bot");
  const loading = chat.lastChild;

  try {
    const res = await fetch("/.netlify/functions/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history }),
    });
    const { answer } = await res.json();

    // remove loading
    chat.removeChild(loading);

    if (answer) {
      appendMessage(answer, "bot");
      history.push({ role: "assistant", content: answer });
    } else {
      appendMessage("Entschuldigung, da ist etwas schiefgelaufen.", "bot");
    }
  } catch {
    chat.removeChild(loading);
    appendMessage("Fehler beim Serverkontakt. Bitte später erneut.", "bot");
  }
};

function appendMessage(txt, cls) {
  const d = document.createElement("div");
  d.className = "message " + cls;
  d.textContent = txt;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}
