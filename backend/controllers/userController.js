import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select("_id name email avatar isOnline");
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
