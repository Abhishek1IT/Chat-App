import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

// Create or Get Chat
export const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;
    const myId = req.user.id;

    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [myId, userId] },
    }).populate("participants", "-password");

    // If chat doesn't exist, create a new one
   if (!chat) {
      chat = await Chat.create({
        participants: [myId, userId],
      });

      chat = await Chat.findById(chat.id).populate(
        "participants",
        "-password"
      );
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all chats for a user
export const getMyChats  = async (req, res) => {
  try {
    const chats = await Chat.find({
        participants: req.user.id,
    }).populate("participants", "-password")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

      res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark messages as seen
export const getChatMessages  = async (req, res) => {
    try {
        const { userId } = req.params;

        const messages = await Message.find({
             $or: [
        { senderId: req.user.id, receiverId: userId },
        { senderId: userId, receiverId: req.user.id },
      ],
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};