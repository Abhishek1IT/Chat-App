import { getIO, getUsers } from "../socket/socket.js";
import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import e from "cors";

export const sendMessage = async (req, res) => {
  try {
    const io = getIO();
    const users = getUsers();

    // Support groupId for group chat, receiverId for personal chat
    const { receiverId, groupId, message } = req.body;
    const senderId = req.user._id;

    // File Upload Handling
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
    if ((!receiverId && !groupId) || (!message && !fileUrl)) {
      return res.status(400).json({
        message: "Message content or file is required",
      });
    }

    let chatRoom;
    let finalReceiverId = receiverId;

    if (groupId) {
      // Group chat
      chatRoom = await Chat.findById(groupId);
      if (!chatRoom || !chatRoom.isGroupChat) {
        return res.status(400).json({ message: "Invalid group chat" });
      }
      finalReceiverId = groupId;
    } else {
      // Personal chat
      if (senderId.toString() === receiverId.toString()) {
        return res.status(400).json({
          message: "Cannot send message to yourself",
        });
      }
      const participants = [senderId.toString(), receiverId.toString()].sort();
      chatRoom = await Chat.findOne({ participants });
      if (!chatRoom) {
        chatRoom = await Chat.create({
          participants,
          isGroupChat: false,
        });
      }
    }

    // Save message
    const newMessage = await Message.create({
      senderId,
      receiverId: finalReceiverId,
      message,
      messageType,
      fileUrl,
      status: "sent",
    });

    // Save latest message in chat
    chatRoom.lastMessage = newMessage._id;
    chatRoom.lastMessageText = message || (fileUrl ? "File" : "");
    chatRoom.lastMessageTime = new Date();
    await chatRoom.save();

    // Populate message
    const populatedMessage = await newMessage.populate([
      { path: "senderId", select: "name email avatar" },
    ]);

    // Emit Message (Group or Personal)
    if (chatRoom.isGroupChat) {
      chatRoom.participants.forEach((memberId) => {
        if (users[memberId]) {
          users[memberId].forEach((socketId) => {
            io.to(socketId).emit("receiveMessage", populatedMessage);
          });
        }
      });
    } else {
      if (users[receiverId]) {
        users[receiverId].forEach((socketId) => {
          io.to(socketId).emit("receiveMessage", populatedMessage);
        });

        newMessage.status = "delivered";
        newMessage.deliveredTo.push(senderId);
        await newMessage.save();
      }
    }

    if (users[senderId]) {
      users[senderId].forEach((socketId) => {
        io.to(socketId).emit("receiveMessage", populatedMessage);
      });
    }

    return res.status(201).json({ message: populatedMessage });
  } catch (error) {
    console.error(error);
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
      },
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

export const groupChatDelivered = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user._id;

    const result = await Message.updateMany(
      {
        receiverId: groupId,
        deliveredTo: { $ne: userId },
      },
      {
        $addToSet: { deliveredTo: userId },
      },
    );

    // Always return success, even if nothing was updated (idempotent)
    res.json({ message: "Messages marked as delivered", matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const io = getIO();
    const users = getUsers();

    const updatedMessage = await Message.findOneAndUpdate(
      {
        _id: req.params.id,
        senderId: req.user._id,
      },
      {
        message,
        isedited: true,
      },
      { new: true },
    );

    if (!updatedMessage) {
      return res
        .status(404)
        .json({ message: "Message not found or unauthorized" });
    }

    if (users[updatedMessage.senderId]) {
      users[updatedMessage.senderId].forEach((socketId) => {
        io.to(socketId).emit("messageEdited", updatedMessage);
      });
    }
    if (users[updatedMessage.receiverId]) {
      users[updatedMessage.receiverId].forEach((socketId) => {
        io.to(socketId).emit("messageEdited", updatedMessage);
      });
    }

    res.json({ message: updatedMessage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const io = getIO();
    const users = getUsers();

    const deletedMessage = await Message.findOneAndDelete({
      _id: req.params.id,
      senderId: req.user._id,
    });

    if (!deletedMessage) {
      return res
        .status(404)
        .json({ message: "Message not found or unauthorized" });
    }

    if (users[deletedMessage.senderId]) {
      users[deletedMessage.senderId].forEach((socketId) => {
        io.to(socketId).emit("messageDeleted", deletedMessage._id);
      });
    }
    if (users[deletedMessage.receiverId]) {
      users[deletedMessage.receiverId].forEach((socketId) => {
        io.to(socketId).emit("messageDeleted", deletedMessage._id);
      });
    }

    res.json({ message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forwardMessage = async (req, res) => {
  try {
    const { receiverId, messageId } = req.body;
    const senderId = req.user._id;

    const originalMessage = await Message.findById(messageId);

    if (!originalMessage) {
      return res.status(404).json({ message: "Original message not found" });
    }

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({
        message: "Cannot forward message to yourself",
      });
    }

    const participants = [senderId.toString(), receiverId.toString()].sort();

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message: originalMessage.message,
      messageType: originalMessage.messageType,
      fileUrl: originalMessage.fileUrl,
      mimetype: originalMessage.mimetype,
      isForwarded: true,
    });

    let chat = await Chat.findOne({ participants });
    if (!chat) {
      chat = await Chat.create({ participants });
    }

    chat.lastMessage = newMessage._id;
    chat.lastMessageText =
      newMessage.message || (newMessage.fileUrl ? "File" : "");
    chat.lastMessageTime = new Date();
    await chat.save();

    const populatedMessage = await newMessage.populate([
      { path: "senderId", select: "name" },
      { path: "receiverId", select: "name" },
    ]);

    res.json({ message: populatedMessage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete message for me (per user)
export const deleteMessageForMe = async (req, res) => {
  try {
    const io = getIO();
    const users = getUsers();

    const userId = req.user._id;
    const messageId = req.params.id;
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    // Already deleted for this user
    if (message.deletedFor.includes(userId)) {
      return res.status(200).json({ message: "Already deleted for this user" });
    }
    message.deletedFor.push(userId);
    await message.save();

    if (users[userId]) {
      users[userId].forEach((socketId) => {
        io.to(socketId).emit("messageDeletedForMe", messageId);
      });
    }

    return res.json({ message: "Message deleted for me" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
