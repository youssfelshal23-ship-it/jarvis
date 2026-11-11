const $ = (id) => document.getElementById(id);
const messages = $("messages");
function addMessage(who, text) {
  const item = document.createElement("div");
  item.className = "message " + who;
  const label = document.createElement("div");
  label.className = "speaker";
  label.textContent = who === "user" ? "YOU" : "JARVIS";
  const body = document.createElement("p");
  body.textContent = text;
  item.append(label, body);
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
}
function replyTo(text) {
  // Phase 1 uses a local demo reply. The real AI connection is added in Phase 2.
  const lower = text.toLowerCase();
  let answer = "Command received, sir. This is the Phase 1 interface demo. In Phase 2, I will connect to the AI engine so I can answer naturally.";
  if (lower.includes("hello") || lower.includes("مرحبا") || lower.includes("ازيك")) answer = "Hello, sir. JARVIS interface is online and awaiting your instructions.";
  if (lower.includes("وقت") || lower.includes("time")) answer = "I can provide live information once the AI service is connected, sir.";
  addMessage("jarvis", answer);
  speak(answer);
}
function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-GB";
  utterance.rate = 0.94;
  utterance.pitch = 0.88;
  const voices = window.speechSynthesis.getVoices();
  const british = voices.find(v => v.lang && v.lang.toLowerCase().startsWith("en-gb"));
  if (british) utterance.voice = british;
  window.speechSynthesis.speak(utterance);
}
$("chatForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const text = $("messageInput").value.trim();
  if (!text) return;
  addMessage("user", text);
  $("messageInput").value = "";
  replyTo(text);
});
$("clearButton").addEventListener("click", () => {
  messages.innerHTML = "";
  addMessage("jarvis", "Conversation cleared, sir. Ready when you are.");
});
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "ar-EG"; // غيّرها إلى en-GB لو هتتكلم إنجليزي
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.onstart = () => {
    $("micButton").classList.add("listening");
    $("micLabel").textContent = "LISTENING...";
    $("systemStatus").textContent = "LISTENING";
    $("coreState").textContent = "ACTIVE";
  };
  recognition.onend = () => {
    $("micButton").classList.remove("listening");
    $("micLabel").textContent = "TAP TO SPEAK";
    $("systemStatus").textContent = "STANDBY";
    $("coreState").textContent = "READY";
  };
  recognition.onerror = (event) => {
    $("voiceHint").textContent = "Microphone issue: " + event.error + ". Check browser permission and internet connection.";
  };
  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    addMessage("user", text);
    replyTo(text);
  };
  $("micButton").addEventListener("click", () => {
    try { recognition.start(); } catch (e) { $("voiceHint").textContent = "Please wait a moment, then tap the microphone again."; }
  });
} else {
  $("voiceState").textContent = "NOT SUPPORTED";
  $("voiceHint").textContent = "Speech recognition is not supported in this browser. Open this app in Google Chrome on Android.";
  $("micButton").addEventListener("click", () => {
    $("voiceHint").textContent = "Please use Google Chrome on Android for voice input.";
  });
}
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
