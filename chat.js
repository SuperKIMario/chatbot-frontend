// chat.js
const chat = document.getElementById("chat");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// Chat-History aus localStorage
const history = JSON.parse(localStorage.getItem("skimChatHistory") || "[]");
history.forEach(msg => appendMessage(msg.content, msg.role));

function saveHistory() {
  localStorage.setItem("skimChatHistory", JSON.stringify(history));
}

function appendMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `message ${sender === "user" ? "user" : "bot"}`;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

sendBtn.onclick = async () => {
  const message = input.value.trim();
  if (!message) return;

  // 1) User-Nachricht anhängen & speichern
  appendMessage(message, "user");
  history.push({ role: "user", content: message });
  saveHistory();
  input.value = "";

  // 2) Lade-Indikator
  const loading = document.createElement("div");
  loading.className = "message bot loading";
  loading.textContent = "...";
  chat.appendChild(loading);
  chat.scrollTop = chat.scrollHeight;

  try {
    // 3) Anfrage an unsere Function
    const res = await fetch("/.netlify/functions/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history })
    });
    const data = await res.json();
    chat.removeChild(loading);

    if (data.answer) {
      appendMessage(data.answer, "assistant");
      history.push({ role: "assistant", content: data.answer });
      saveHistory();
    } else {
      appendMessage("Entschuldigung, da ist etwas schiefgelaufen.", "assistant");
    }

  } catch (e) {
    chat.removeChild(loading);
    appendMessage("Fehler beim Serverkontakt. Bitte versuche es später.", "assistant");
  }
};
