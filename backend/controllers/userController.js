
import User from "../models/User.js";
import Chatbot from "../models/Chatbot.js";
import Message from "../models/Message.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
    .select("_id name email avatar isOnline lastSeen");

    // Get bot user (assume only one bot)
    const bot = await Chatbot.findOne({ isBot: true })
    .select("_id name email");

    let allUsers = users;

    if (bot) {

      // Add bot at the top
      allUsers = [
        { ...bot.toObject(), isBot: true, isOnline: true, avatar: "🤖" },
        ...users
      ];
    }
    res.json({ users: allUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsersWithLastMessage = async (req, res) => {
  try {
    const users = await User.find({})
      .select("_id name email avatar isOnline lastSeen");

    // Get bot user (assume only one bot)
    const bot = await Chatbot.findOne({ isBot: true })
      .select("_id name email");

    const usersWithLastMsg = await Promise.all(users.map(async (user) => {
      const lastMsg = await Message.findOne({
        $or: [
          { senderId: req.user.id, receiverId: user._id },
          { senderId: user._id, receiverId: req.user.id }
        ],
        deletedFor: { $ne: req.user.id }
      })
        .sort({ createdAt: -1 })
        .select("message messageType createdAt senderId receiverId status");
      return {
        ...user.toObject(),
        lastMessage: lastMsg ? lastMsg.message : "",
        lastMessageType: lastMsg ? lastMsg.messageType : "",
        lastMessageTime: lastMsg ? lastMsg.createdAt : null,
        lastMessageStatus: lastMsg ? lastMsg.status : "",
        lastMessageSenderId: lastMsg ? (lastMsg.senderId && lastMsg.senderId.toString ? lastMsg.senderId.toString() : lastMsg.senderId) : "",
      };
    }));

    let allUsers = usersWithLastMsg;
    if (bot) {
      allUsers = [
        { ...bot.toObject(), isBot: true, isOnline: true, avatar: "🤖", lastMessage: "", lastMessageType: "", lastMessageTime: null },
        ...usersWithLastMsg
      ];
    }
    res.json({ users: allUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    // Remove user from User collection only
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted, group memberships and messages retained." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
