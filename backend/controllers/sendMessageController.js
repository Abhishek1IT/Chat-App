import { getIO, getUsers } from "../socket/socket.js";
import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

// SEND MESSAGE (1-to-1)
export const sendMessage = async (req, res) => {
  try {
    const io = getIO();
    const users = getUsers();

    const { receiverId, message = "" } = req.body;
    const senderId = req.user._id;

    // File Handling
    let fileUrl = "";
    let messageType = "text";
    let mimetype = "";

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      mimetype = req.file.mimetype;
      messageType = "file";
    }

    // Validations
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

    // Always sorted for same chat
    const participants = [senderId.toString(), receiverId.toString()].sort();

    // Create Message
    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
      messageType,
      fileUrl,
      mimetype,
      status: "sent",
    });

    // Find / Create Chat
    let chat = await Chat.findOne({ participants });

    if (!chat) {
      chat = await Chat.create({ participants });
    }

    chat.lastMessage = newMessage._id;
    chat.lastMessageText = message || (fileUrl ? "File" : "");
    chat.lastMessageTime = new Date();
    await chat.save();

    // Populate message for response
    const populatedMessage = await newMessage.populate([
      { path: "senderId", select: "name email" },
      { path: "receiverId", select: "name email" }
    ]);

    // SOCKET: Send message to RECEIVER (all devices)
    if (users[receiverId]) {
      users[receiverId].forEach((socketId) => {
        io.to(socketId).emit("receiveMessage", populatedMessage);
      });

      // Mark delivered
      newMessage.status = "delivered";
      newMessage.deliveredAt = new Date();
      await newMessage.save();
    }

    // SOCKET: Send message to SENDER (all devices)
    if (users[senderId]) {
      users[senderId].forEach((socketId) => {
        io.to(socketId).emit("receiveMessage", populatedMessage);
      });
    }

    res.status(201).json({
      message: {
        _id: newMessage._id,
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        message: newMessage.message,
        messageType: newMessage.messageType,
        fileUrl: newMessage.fileUrl,
        fileName: req.file?.originalname || "",
        mimetype: newMessage.mimetype,
        status: newMessage.status,
        createdAt: newMessage.createdAt,
        updatedAt: newMessage.updatedAt
      }
    });

  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ message: error.message });
  }
};

// MARK AS SEEN
export const markAsSeen = async (req, res) => {
  try {
    const { senderId } = req.body;
    const receiverId = req.user._id;

    if (!senderId) {
      return res.status(400).json({ message: "Sender ID required" });
    }

    // Update messages
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
    console.error("markAsSeen error:", error);
    res.status(500).json({ message: error.message });
  }
};