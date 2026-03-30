import User from "../models/User.js";
import Chatbot from "../models/Chatbot.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
    .select("_id name email avatar isOnline");

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
