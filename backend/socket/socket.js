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
        console.log(`User ${socket.userId || 'unknown'} joined room: ${chatId}`);
      }
    });

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
        console.log(`User online: ${userId}, socket: ${socket.id}`);

        // update DB
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date(),
        });

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

    // Add Admin
    socket.on("Add Admin", ({ groupId, userId }) => {
      console.log(`Add Admin: user ${userId} to group ${groupId}`);
      socket.to(groupId).emit("Add Admin", { groupId, userId });
    });

    // Remove Admin
    socket.on("Remove Admin", ({ groupId, userId }) => {
      console.log(`Remove Admin: user ${userId} from group ${groupId}`);
      socket.to(groupId).emit("Remove Admin", { groupId, userId });
    });

    // Admin Add User
    socket.on("Admin Add User", ({ groupId, userId }) => {
      console.log(`Admin Add User: user ${userId} to group ${groupId}`);
      socket.to(groupId).emit("Admin Add User", { groupId, userId });
    });

    // Admin Remove User
    socket.on("Admin Remove User", ({ groupId, userId }) => {
      console.log(`Admin Remove User: user ${userId} from group ${groupId}`);
      socket.to(groupId).emit("Admin Remove User", { groupId, userId });
    });

    // Leave Group
    socket.on("Leave Group", ({ groupId, userId }) => {
      console.log(`Leave Group: user ${userId} left group ${groupId}`);
      socket.to(groupId).emit("Leave Group", { groupId, userId });
    });

    // Delete Group
    socket.on("Delete Group", ({ groupId }) => {
      console.log(`Delete Group: group ${groupId} deleted`);
      socket.to(groupId).emit("Delete Group", { groupId });
    });

    // DISCONNECT
    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.userId || 'unknown'}, socket: ${socket.id}`);
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