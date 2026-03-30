import { Server } from "socket.io";
import User from "../models/User.js";

let users = {};
let ioInstance = null;

const initSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  ioInstance = io;

  io.on("connection", (socket) => {
    // JOIN CHAT ROOM FOR TYPING INDICATOR
    socket.on("join", ({ chatId }) => {
      if (chatId) {
        socket.join(chatId);
      }
    });
    console.log("User connected:", socket.id);

    // USER ONLINE
    socket.on("userOnline", async (userId) => {
      try {
        if (!userId) return;

        // multiple sockets support
        if (!users[userId]) {
          users[userId] = [];
        }
        users[userId].push(socket.id);

        socket.userId = userId;

        // update DB
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date(),
        });

        console.log("User online:", userId);

        // broadcast online users
        io.emit("onlineUsers", Object.keys(users));
      } catch (err) {
        console.error("userOnline error:", err.message);
      }
    });

    // TYPING INDICATOR
    socket.on("typing", ({ chatId, userId }) => {
      socket.to(chatId).emit("typing", { chatId, userId });
    });

    // DISCONNECT
    socket.on("disconnect", async () => {
      try {
        const userId = socket.userId;

        if (!userId) return;

        // remove this socketId
        users[userId] = users[userId].filter((id) => id !== socket.id);

        // if no active sockets → user offline
        if (users[userId].length === 0) {
          delete users[userId];

          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date(),
          });

          console.log("User offline:", userId);
        }

        // broadcast update
        io.emit("onlineUsers", Object.keys(users));
      } catch (err) {
        console.error("disconnect error:", err.message);
      }
    });
  });
};

// Safe getter
export const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket not initialized");
  }
  return ioInstance;
};

// Get online users
export const getUsers = () => users;

export default initSocket;
