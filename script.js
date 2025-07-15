// Get DOM elements
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.innerHTML =
  '<div class="msg ai">👋 Hello! How can I help you today?</div>';

// Conversation history array (resets with each new question)
let conversationHistory = [];

// Function to append a message to the chat window (supports HTML)
function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("msg", sender);
  msg.innerHTML = text;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return msg;
}

// Handle form submit

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  // Reset chat window for new question (history resets)
  chatWindow.innerHTML = "";
  conversationHistory = [];

  // Add user message to history
  conversationHistory.push({ role: "user", content: message });

  // Show user message as a distinct bubble
  appendMessage("user", message);
  userInput.value = "";

  // Show user's latest question above the AI response
  const latestQ = document.createElement("div");
  latestQ.className = "msg latest-question";
  latestQ.innerHTML = `<strong>You asked:</strong> ${message}`;
  chatWindow.appendChild(latestQ);

  // Show bot typing message
  const typingMsg = appendMessage(
    "ai",
    "Coming to your assistance<span class='dots'>.</span>"
  );

  // Animate dots
  let dotCount = 1;
  const dotInterval = setInterval(() => {
    dotCount = (dotCount % 3) + 1;
    typingMsg.innerHTML =
      "Coming to your assistance" +
      "<span class='dots'>" +
      ".".repeat(dotCount) +
      "</span>";
  }, 500);

  // Prepare messages for API (system + user)
  const messages = [
    {
      role: "system",
      content:
        "You are a L'Oréal product expert helping users find skincare, makeup, haircare, and fragrance products. Only answer questions related to L'Oréal. Track the user's name and past questions in this session.",
    },
    ...conversationHistory,
  ];

  // Fetch OpenAI response
  const response = await fetch(
    "https://morning-fire-0fc5.samanthasears2002.workers.dev/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    }
  );

  const data = await response.json();
  const reply = data.choices[0].message.content;

  // Remove typing message + interval
  typingMsg.remove();
  clearInterval(dotInterval);

  // Show actual reply as a distinct bubble
  appendMessage("ai", reply);
});
