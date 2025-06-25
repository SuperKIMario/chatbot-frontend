// chat.js
const chat = document.getElementById("chat");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
let history = [];

// Initiale Bot-Begrüßung
appendMessage("Fröhlichen guten Tag. Ich bin SKIM. Möchtest du mehr über Mario erfahren?", "bot-init");

// Funktion zum Anhängen
function appendMessage(text, sender) {
  const div = document.createElement("div");
  div.className = "message " + (sender === "bot" ? "bot" : sender === "bot-init" ? "bot-init" : "user");
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// Klick-Handler
sendBtn.addEventListener("click", async () => {
  const message = input.value.trim();
  if (!message) return;

  // User anzeigen + history speichern
  appendMessage(message, "user");
  history.push({ role: "user", content: message });
  input.value = "";

  // Lade-Indikator
  appendMessage("...", "bot");
  const loading = chat.lastChild;

  try {
    const res = await fetch("/.netlify/functions/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history })
    });
    const data = await res.json();
    chat.removeChild(loading);

    if (data.answer) {
      appendMessage(data.answer, "bot");
      history.push({ role: "assistant", content: data.answer });
    } else {
      appendMessage("Entschuldigung, da ist etwas schiefgelaufen.", "bot");
    }
  } catch (e) {
    chat.removeChild(loading);
    appendMessage("Fehler beim Serverkontakt. Bitte später erneut.", "bot");
  }
});
