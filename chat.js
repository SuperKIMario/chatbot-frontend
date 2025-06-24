const chat = document.getElementById("chat");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// Begrüßung
const GREETING = "Fröhlichen guten Tag. Ich bin SKIM. Möchtest du mehr über Mario erfahren?";

let history = [];

// Verlauf laden
const stored = localStorage.getItem("skimHistory");
if (stored) {
  history = JSON.parse(stored);
  history.forEach(msg => {
    const cls = msg.role === "user" ? "user" : (msg.role === "system" ? "system-message" : "bot");
    appendMessage(msg.content, cls);
  });
} else {
  appendMessage(GREETING, "system-message");
  history.push({ role: "system", content: GREETING });
  localStorage.setItem("skimHistory", JSON.stringify(history));
}

function appendMessage(text, cls) {
  const div = document.createElement("div");
  div.className = "message " + cls;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function saveHistory() {
  localStorage.setItem("skimHistory", JSON.stringify(history));
}

sendBtn.onclick = async () => {
  const msg = input.value.trim();
  if (!msg) return;

  appendMessage(msg, "user");
  history.push({ role: "user", content: msg });
  saveHistory();
  input.value = "";

  appendMessage("...", "bot");
  const loading = chat.querySelector(".bot:last-child");

  try {
    const res = await fetch("/.netlify/functions/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: msg }),
    });
    const data = await res.json();
    chat.removeChild(loading);

    const reply = data.reply || "Entschuldigung, da ist etwas schiefgelaufen.";
    appendMessage(reply, "bot");
    history.push({ role: "assistant", content: reply });
    saveHistory();
  } catch (err) {
    chat.removeChild(loading);
    appendMessage("Fehler beim Serverkontakt. Bitte später erneut versuchen.", "bot");
  }
};
