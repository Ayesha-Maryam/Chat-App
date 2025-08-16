const app = require("./app");
const connectDB = require("./config/db");
const http = require("http");
const User = require("./models/User");
const Message = require("./models/Message");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
require("dotenv").config();
connectDB();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});
const userSockets = new Map();
io.use((socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization || "").replace("Bearer ", "");
    if (!token) return next(new Error("Authentication error: Missing token"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = String(decoded.id);
    next();
  } catch (err) {
    return next(new Error("Authentication error"));
  }
});
io.on("connection", async (socket) => {
  const uid = String(socket.userId);
  console.log(`Socket connected: ${socket.id} — user: ${uid}`);

  if (!userSockets.has(uid)) {
    userSockets.set(uid, new Set());
  }

  userSockets.get(uid).add(socket.id);


  const user = await User.findById(uid).select("isOnline");
  const wasOnline = user?.isOnline || false;


  if (userSockets.get(uid).size === 1 && !wasOnline) {
    await User.findByIdAndUpdate(uid, { isOnline: true });
    const updatedUser = await User.findById(uid).select("-password");
    io.emit("user-status-changed", updatedUser);
  }

  socket.on("private-message", async (payload) => {
    try {
      const { receiverId, content, messageType, fileMeta } = payload || {};
      if (!receiverId || (!content && !fileMeta)) {
        socket.emit("error", "Invalid message payload");
        return;
      }
      
      const newMessage = await Message.create({
        sender: uid,
        receiver: String(receiverId),
        content: content || "",
        messageType: messageType || "text",
        fileMeta: fileMeta || null,
      });
      
      const populated = await Message.findById(newMessage._id)
        .populate("sender", "name avatar")
        .populate("receiver", "name avatar")
        .lean();

      const senderMessage = {...populated, isSender: true};
      const senderSockets = userSockets.get(uid) || [];
      for (const sid of senderSockets) {
        io.to(sid).emit("private-message", {
          ...senderMessage,
          replacesTempId: payload.tempId 
        });
      }
      const receiverMessage = {...populated, isSender: false};
      const receiverSockets = userSockets.get(String(receiverId)) || [];
      for (const sid of receiverSockets) {
        io.to(sid).emit("private-message", receiverMessage);
      }

    } catch (err) {
      console.error("private-message error:", err);
      socket.emit("error", "Failed to send message");
    }
  });
  socket.on("typing", ({ receiverId, isTyping }) => {
    if (!receiverId) return;
    socket.to(String(receiverId)).emit("typing", { senderId: uid, isTyping });
  });
  socket.on("disconnect", async () => {
     console.log(`Socket disconnected: ${socket.id} — user: ${uid}`);
    const set = userSockets.get(uid);
    if (set) {
      set.delete(socket.id);
      
      if (set.size === 0) {
        userSockets.delete(uid);
        const updatedUser = await User.findByIdAndUpdate(
          uid,
          { isOnline: false, lastSeen: Date.now() },
          { new: true }
        ).select("-password");
        
        if (updatedUser) {
          io.emit("user-status-changed", updatedUser);
        }
      }
    }
  });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
