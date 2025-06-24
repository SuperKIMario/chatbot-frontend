const chat = document.getElementById("chat");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

const history = [];

// Chatverlauf aus localStorage laden
const storedHistory = localStorage.getItem('skimChatHistory');
if (storedHistory) {
  const savedHistory = JSON.parse(storedHistory);
  savedHistory.forEach(msg => appendMessage(msg.content, msg.role === 'user' ? 'user' : 'bot'));
  history.push(...savedHistory);
}

// Chatverlauf speichern
function saveHistory() {
  localStorage.setItem('skimChatHistory', JSON.stringify(history));
}

// Nachricht anhängen
function appendMessage(text, sender) {
  const div = document.createElement("div");
  div.className = "message " + sender;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// Lade-Indikator anzeigen
function showLoading() {
  appendMessage("...", "bot");
  return chat.querySelector(".bot:last-child");
}

// Lade-Indikator entfernen
function removeLoading(loadingMessage) {
  chat.removeChild(loadingMessage);
}

// Erste Begrüßung von SKIM beim Laden der Seite
if (history.length === 0) {
  const greeting = "Fröhlichen guten Tag, ich bin SKIM. Was möchtest du über Mario wissen?";
  appendMessage(greeting, "bot");
  history.push({ role: "assistant", content: greeting });
  saveHistory();
}

// Send-Button Event-Handler
sendBtn.onclick = async () => {
  const message = input.value.trim();
  if (!message) return;

  appendMessage(message, "user");
  history.push({ role: "user", content: message });
  saveHistory();
  input.value = "";

  const loadingMessage = showLoading();

  try {
    const response = await fetch("/.netlify/functions/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: message }),
    });

    const data = await response.json();
    removeLoading(loadingMessage);

    if (data.reply) {
      appendMessage(data.reply, "bot");
      history.push({ role: "assistant", content: data.reply });
      saveHistory();
    } else {
      appendMessage("Entschuldigung, da ist etwas schiefgelaufen.", "bot");
    }
  } catch (error) {
    removeLoading(loadingMessage);
    appendMessage("Fehler beim Serverkontakt. Bitte versuche es später erneut.", "bot");
  }
};
