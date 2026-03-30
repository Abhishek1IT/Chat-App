import { getIO, getUsers } from "../socket/socket.js";
import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

export const sendMessage = async (req, res) => {
  try {
    const io = getIO();
    const users = getUsers();

    const { receiverId, message } = req.body;
    const senderId = req.user._id;

    // Handle file upload
    let fileUrl = "";
    let messageType = "text";
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      const mime = req.file.mimetype;
      if (mime.startsWith("image/")) messageType = "image";
      else if (mime.startsWith("video/")) messageType = "video";
      else messageType = "file";
    }

    // Validation
    if (!receiverId || (!message && !fileUrl)) {
      return res.status(400).json({
        message: "Message content or file is required",
      });
    }

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({
        message: "Cannot send message to yourself",
      });
    }

    const participants = [senderId.toString(), receiverId.toString()].sort();

    // Save message
    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
      messageType,
      fileUrl,
      status: "sent",
    });

    // Chat find or create
    let chat = await Chat.findOne({ participants });
    if (!chat) {
      chat = await Chat.create({ participants });
    }

    // Update chat
    chat.lastMessage = newMessage._id;
    chat.lastMessageText = message || (fileUrl ? "File" : "");
    chat.lastMessageTime = new Date();
    await chat.save();

    // Populate message
    const populatedMessage = await newMessage.populate([
      { path: "senderId", select: "name email" },
      { path: "receiverId", select: "name email" },
    ]);

    // Send to receiver (ALL devices)
    if (users[receiverId]) {
      users[receiverId].forEach((socketId) => {
        io.to(socketId).emit("receiveMessage", populatedMessage);
      });

      // mark delivered
      newMessage.status = "delivered";
      newMessage.deliveredAt = new Date();
      await newMessage.save();
    }

    // Send to sender (ALL devices)
    if (users[senderId]) {
      users[senderId].forEach((socketId) => {
        io.to(socketId).emit("receiveMessage", populatedMessage);
      });
    }

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsSeen = async (req, res) => {
  try {
    const { senderId } = req.body; 
    const receiverId = req.user._id;

    await Message.updateMany(
      {
        senderId,
        receiverId,
        status: { $ne: "seen" },
      },
      {
        status: "seen",
        seenAt: new Date(),
      }
    );

    const io = getIO();
    const users = getUsers();

    if (users[senderId]) {
      users[senderId].forEach((socketId) => {
        io.to(socketId).emit("messagesSeen", {
          senderId,
          receiverId,
        });
      });
    }

    res.json({ message: "Messages marked as seen" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};