const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const mongoose = require("mongoose");

const PORT = 5000;

// MongoDB Atlas connection (Mongoose)
mongoose
  .connect(
    "mongodb+srv://djboy2002:Div%401511@djcluster.bzes9yk.mongodb.net/chatApp"
  )
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error(err));

// Message Schema & Model
const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  time: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", messageSchema);

app.use(express.static("public"));
app.set('view engine', 'ejs'); // Or your chosen templating engine

const onlineUsers = {}; // key: socket.id, value: username

// 📌 New API endpoint to fetch all messages
app.get("/chatHistory", async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ time: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

io.on("connection", (socket) => {
  console.log("User connected");

  // When a user joins, save username to socket
  socket.on("user joined", (username) => {
    socket.username = username; // ✅ now socket.username is set
    onlineUsers[socket.id] = username;
    io.emit("user joined", username);
    io.emit("update user list", Object.values(onlineUsers));
  });

  // Unified message handling
  socket.on("chat message", async (data) => {
    const { user, text } = data;

    // Save to MongoDB
    const newMessage = new Message({
      username: user,
      message: text,
    });
    await newMessage.save();

    // Broadcast to everyone
    io.emit("chat message", data);
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      io.emit("user joined", `${socket.username} left the chat`);
      delete onlineUsers[socket.id];
    }
  });
});

http.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
