// chat.js - kompletter Code für Schritt 1

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

// Funktion, um Chatverlauf zu speichern
function saveHistory() {
  localStorage.setItem('skimChatHistory', JSON.stringify(history));
}

// Funktion zum Anhängen einer Nachricht an den Chat
function appendMessage(text, sender) {
  const div = document.createElement("div");
  div.className = "message " + sender;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// Send-Button Event-Handler
sendBtn.onclick = async () => {
  const message = input.value.trim();
  if (!message) return;

  appendMessage(message, "user");
  input.value = "";

  // User-Nachricht in History speichern
  history.push({ role: "user", content: message });
  saveHistory();

  // Lade-Indikator anzeigen
  appendMessage("...", "bot");
  const loadingMessage = chat.querySelector('.bot:last-child');

  try {
    const response = await fetch("/.netlify/functions/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });

    const data = await response.json();

    // Lade-Indikator entfernen
    chat.removeChild(loadingMessage);

    if (data.answer) {
      appendMessage(data.answer, "bot");
      history.push({ role: "assistant", content: data.answer });
      saveHistory();
    } else {
      appendMessage("Entschuldigung, da ist etwas schiefgelaufen.", "bot");
    }
  } catch (error) {
    // Lade-Indikator entfernen bei Fehler
    chat.removeChild(loadingMessage);
    appendMessage("Fehler beim Serverkontakt. Bitte versuche es später erneut.", "bot");
  }
};
