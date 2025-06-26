const chatEl  = document.getElementById("chat");
const inputEl = document.getElementById("userInput");
const btnEl   = document.getElementById("sendBtn");

// Hilfsfunktion zum Anhängen einer Nachricht
function appendMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.textContent = text;
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
}

// ────────────────────────────────────────────────────────────
// NEUER BLOCK: Statische Begrüßung beim Laden
// ────────────────────────────────────────────────────────────
const history = [];
window.addEventListener("DOMContentLoaded", () => {
  const welcome = "Fröhlichen guten Tag. Ich bin SKIM. Möchtest du mehr über Mario erfahren?";
  appendMessage(welcome, "system");
  history.push({ role: "system", content: welcome });
});
// ────────────────────────────────────────────────────────────

btnEl.onclick = async () => {
  const text = inputEl.value.trim();
  if (!text) return;

  // User-Nachricht anzeigen
  appendMessage(text, "user");
  inputEl.value = "";

  // Lade-Indikator
  appendMessage("…", "assistant");
  const load = chatEl.querySelector(".assistant:last-child");

  try {
    const res = await fetch("/.netlify/functions/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: text })
    });
    
    // Custom-Message bei zu vielen Anfragen
    if (res.status === 429) {
      chatEl.removeChild(load);
      appendMessage(
        "Vielen Dank für deine Fragen. Möchtest du noch mehr wissen? Dann buch dir jetzt direkt über mariowittmer.de deinen persönlichen Termin ein. Ich wünsche euch einen bereichernden Austausch.",
        "assistant"
      );
      return;
    }

    const { reply } = await res.json();

    chatEl.removeChild(load);
    appendMessage(reply, "assistant");
  }
  catch (e) {
    chatEl.removeChild(load);
    appendMessage("Fehler beim Serverkontakt. Bitte später erneut.", "assistant");
  }
};
