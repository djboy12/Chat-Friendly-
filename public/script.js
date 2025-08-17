const socket = io();
let username = "";

function joinChat() {
  const input = document.getElementById("usernameInput");
  username = input.value.trim();
  if (!username) return alert("Please enter a name");

  document.getElementById("login-container").style.display = "none";
  document.getElementById("chat-container").style.display = "flex";

  socket.emit("user joined", username);
}

const form = document.getElementById("chat-form");
const input = document.getElementById("msg");
const messages = document.getElementById("messages");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat message", {
      user: username,
      text: input.value,
      time: new Date()
    });
    input.value = "";
  }
});

socket.on("chat message", (data) => {
  const msgDiv = document.createElement("div");
  const timestamp = new Date(data.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  msgDiv.classList.add("message");
  msgDiv.classList.add(data.user === username ? "my-message" : "other-message");
  msgDiv.innerHTML = `<strong>${data.user}</strong><br>${data.text}<span class="timestamp">${timestamp}</span>`;

  messages.appendChild(msgDiv);
  messages.scrollTop = messages.scrollHeight;
});

socket.on("user joined", (name) => {
  const sysMsg = document.createElement("div");
  sysMsg.classList.add("message", "other-message");
  sysMsg.style.fontStyle = "italic";
  sysMsg.textContent = `${name} joined the chat`;
  messages.appendChild(sysMsg);
  messages.scrollTop = messages.scrollHeight;
});
