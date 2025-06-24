import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import jwt from "jsonwebtoken";
import connectDB from "./db.js";
import Message from "./dbModels/message.js";
import cookieParser from "cookie-parser";
import auth from "./routes/auth.js";
import dotenv from "dotenv";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", auth);

// In-memory user storage
const users = {};        // socket.id -> username
const userSockets = {};  // username -> socket.id

// Socket.IO logic
io.on('connection', (socket) => {
  console.log("🔌 User connected:", socket.id);

  try {
    const token = socket.handshake.headers.cookie
      ?.split(';')
      .find(c => c.trim().startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      console.log("❌ No token found in cookies");
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const username = decoded.username;

    users[socket.id] = username;
    userSockets[username] = socket.id;

    console.log(`✅ User authenticated: ${username} (${socket.id})`);
  } catch (err) {
    console.log("❌ Error verifying token:", err);
  }

  // ✅ FIXED: correct event name + logs
  socket.on('private_message', async ({ to, message }) => {
    const from = users[socket.id];
    console.log(`📨 Message received from ${from} to ${to}: ${message}`);

    if (!from || !to || !message) {
      console.log("⚠️ Missing data in message");
      return;
    }

    try {
      const saved = await Message.create({ from, to, message });
      console.log("💾 Message saved to DB:", saved);

      const targetSocket = userSockets[to];
      if (targetSocket) {
        console.log("📤 Emitting to target user:", to);
        io.to(targetSocket).emit('private_message', { from, message });
      } else {
        console.log("⛔ Target user is offline");
      }
    } catch (err) {
      console.error("❌ Error saving message:", err);
    }
  });

  socket.on('disconnect', () => {
    const username = users[socket.id];
    console.log(`🔌 Disconnected: ${username} (${socket.id})`);
    delete users[socket.id];
    delete userSockets[username];
  });
});

// Messages route
app.get("/api/messages/:username", async (req, res) => {
  try {
    const user = req.query.self;
    const reciever = req.params.username;

    const messages = await Message.find({
      $or: [
        { from: user, to: reciever },
        { from: reciever, to: user }
      ]
    }).sort({ timestamp: 1 });

    res.send(messages);
  } catch (err) {
    console.error("❌ Error fetching messages:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Chat list route
app.get("/api/conversations", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = decoded.username;

    const messages = await Message.find({
      $or: [{ from: user }, { to: user }]
    });

    const chatUsers = new Set();
    messages.forEach(msg => {
      if (msg.from !== user) chatUsers.add(msg.from);
      if (msg.to !== user) chatUsers.add(msg.to);
    });

    res.json([...chatUsers]);
  } catch (err) {
    console.error("❌ Error in fetching conversations:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

server.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
