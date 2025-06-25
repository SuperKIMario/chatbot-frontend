// chat.js
const chat = document.getElementById("chat");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// Chat-Verlauf in JS-Array & localStorage
const history = [];
const stored = localStorage.getItem("skimChatHistory");
if (stored) {
  const saved = JSON.parse(stored);
  saved.forEach(m => appendMessage(m.content, m.role));
  history.push(...saved);
}

function saveHistory() {
  localStorage.setItem("skimChatHistory", JSON.stringify(history));
}

function appendMessage(text, role) {
  const div = document.createElement("div");
  div.className = "message " + (role === "user" ? "user" : "assistant");
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

sendBtn.onclick = async () => {
  const message = input.value.trim();
  if (!message) return;

  // User-Nachricht
  appendMessage(message, "user");
  history.push({ role: "user", content: message });
  saveHistory();
  input.value = "";

  // Lade-Indikator als Assistant-Nachricht
  appendMessage("⏳", "assistant");

  try {
    const res = await fetch("/.netlify/functions/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history })
    });
    const { reply } = await res.json();

    // Lade-Indikator entfernen
    chat.lastChild.remove();

    // Assistants-Antwort
    appendMessage(reply, "assistant");
    history.push({ role: "assistant", content: reply });
    saveHistory();
  } catch (e) {
    chat.lastChild.remove();
    appendMessage("Entschuldigung, da ist etwas schiefgelaufen.", "assistant");
  }
};
