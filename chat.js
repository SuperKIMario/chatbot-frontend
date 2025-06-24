const chat = document.getElementById("chat");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

const history = [];

// Chatverlauf aus localStorage laden
const storedHistory = localStorage.getItem("skimChatHistory");
if (storedHistory) {
  const savedHistory = JSON.parse(storedHistory);
  savedHistory.forEach(msg => appendMessage(msg.content, msg.role === 'user' ? 'user' : 'bot'));
  history.push(...savedHistory);
}

// Begrüßung direkt anzeigen
appendMessage("Fröhlichen guten Tag....was kannst du mir über Mario sagen?", "bot");

function saveHistory() {
  localStorage.setItem("skimChatHistory", JSON.stringify(history));
}

function appendMessage(text, sender) {
  const div = document.createElement("div");
  div.className = "message " + sender;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// Klick-Event auf den Senden-Button
sendBtn.onclick = async () => {
  const message = input.value.trim();
  if (!message) return;

  appendMessage(message, "user");
  input.value = "";

  history.push({ role: "user", content: message });
  saveHistory();

  appendMessage("...", "bot");  // Ladeanzeige
  const loadingMessage = chat.querySelector(".bot:last-child");

  try {
    const response = await fetch("/.netlify/functions/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    chat.removeChild(loadingMessage);

    if (data.reply) {
      appendMessage(data.reply, "bot");
      history.push({ role: "assistant", content: data.reply });
      saveHistory();
    } else {
      appendMessage("Entschuldigung, da ist etwas schiefgelaufen.", "bot");
    }
  } catch (error) {
    chat.removeChild(loadingMessage);
    appendMessage("Fehler beim Serverkontakt. Bitte später erneut versuchen.", "bot");
  }
};
