const chat = document.getElementById("chat");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

const history = JSON.parse(localStorage.getItem("skimHistory") || "[]");

// Alte Sitzung wiederherstellen
history.forEach(msg => appendMessage(msg.content, msg.role));

function saveHistory() {
  localStorage.setItem("skimHistory", JSON.stringify(history));
}

function appendMessage(text, sender) {
  const div = document.createElement("div");
  div.className = "message " + sender;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

sendBtn.onclick = async () => {
  const message = input.value.trim();
  if (!message) return;

  appendMessage(message, "user");
  history.push({ role: "user", content: message });
  saveHistory();
  input.value = "";

  // Lade-Indicator
  appendMessage("…", "bot");
  const loading = chat.lastChild;

  try {
    const res = await fetch("/.netlify/functions/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history })
    });
    const { answer } = await res.json();
    chat.removeChild(loading);
    appendMessage(answer, "bot");
    history.push({ role: "bot", content: answer });
    saveHistory();
  } catch {
    chat.removeChild(loading);
    appendMessage("Entschuldigung, da ist etwas schiefgelaufen.", "bot");
  }
};
