const chatEl = document.getElementById("chat");
const inputEl = document.getElementById("userInput");
const btnEl  = document.getElementById("sendBtn");

btnEl.onclick = async () => {
  const text = inputEl.value.trim();
  if (!text) return;

  // User-Nachricht anzeigen
  const uDiv = document.createElement("div");
  uDiv.className = "message user";
  uDiv.textContent = text;
  chatEl.appendChild(uDiv);
  chatEl.scrollTop = chatEl.scrollHeight;

  inputEl.value = "";

  // Lade-Indikator
  const load = document.createElement("div");
  load.className = "message assistant";
  load.textContent = "…";
  chatEl.appendChild(load);
  chatEl.scrollTop = chatEl.scrollHeight;

  try {
    const res = await fetch("/.netlify/functions/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: text })
    });
    const { reply } = await res.json();

    chatEl.removeChild(load);
    const aDiv = document.createElement("div");
    aDiv.className = "message assistant";
    aDiv.textContent = reply;
    chatEl.appendChild(aDiv);
    chatEl.scrollTop = chatEl.scrollHeight;
  }
  catch (e) {
    chatEl.removeChild(load);
    const err = document.createElement("div");
    err.className = "message assistant";
    err.textContent = "Fehler beim Serverkontakt. Bitte später erneut.";
    chatEl.appendChild(err);
    chatEl.scrollTop = chatEl.scrollHeight;
  }
};
