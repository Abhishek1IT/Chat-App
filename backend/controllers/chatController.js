import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import { getIO } from "../socket/socket.js";

// Helper: Delete group and messages, emit event
const autoDeleteGroupIfEmpty = async (chat) => {
  if (
    chat.isGroupChat &&
    Array.isArray(chat.admin) &&
    chat.admin.length === 1 &&
    Array.isArray(chat.participants) &&
    chat.participants.length === 1 &&
    chat.participants[0].toString() === chat.admin[0].toString()
  ) {
    // Only one admin and no other users
    await Chat.findByIdAndDelete(chat._id);
    await Message.deleteMany({ chatId: chat._id });
    const io = getIO();
    io.to(chat._id.toString()).emit("DeleteGroup", { groupId: chat._id });
    return true;
  }
  return false;
};

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

      chat = await Chat.findById(chat.id).populate("participants", "-password");

      // Emit new chat event to both users
      const io = getIO();
      [myId, userId].forEach((id) => {
        io.to(id.toString()).emit("NewChat", { chat });
      });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all chats for a user
export const getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id,
    })
      .populate("participants", "-password")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark messages as seen
export const getChatMessages = async (req, res) => {
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

export const groupChat = async (req, res) => {
  try {
    const { name, participants } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    if (
      !participants ||
      !Array.isArray(participants) ||
      participants.length < 2
    ) {
      return res
        .status(400)
        .json({ message: "At least 2 participants required" });
    }

    const uniqueParticipants = [...new Set([...participants, req.user.id])];

    // Create Group Chat
    const chat = await Chat.create({
      name,
      participants: uniqueParticipants,
      admin: [req.user.id],
      isGroupChat: true,
    });

    // Emit group created event to all participants
    const io = getIO();
    uniqueParticipants.forEach((id) => {
      io.to(id.toString()).emit("GroupCreated", { chat });
    });

    res.json({
      message: "Group created successfully",
      chat,
    });
  } catch (error) {
    console.error("Group Chat Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addAdmin = async (req, res) => {
  try {
    const { userId, groupId } = req.body;

    const chat = await Chat.findById(groupId);

    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ message: "Group chat not found" });
    }

    if (!chat.admin.includes(req.user.id)) {
      return res
        .status(403)
        .json({ message: "Only group admins can add new admins" });
    }

    if (!chat.participants.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User must be a participant to be an admin" });
    }

    if (chat.admin.includes(userId)) {
      return res.status(400).json({ message: "User is already an admin" });
    }

    chat.admin.push(userId);
    await chat.save();

    // Emit admin added event to group
    const io = getIO();
    io.to(groupId).emit("AddAdmin", { groupId, userId });

    res.json({ message: "Admin added successfully", chat });
  } catch (error) {
    console.error("Add Admin Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeAdmin = async (req, res) => {
  try {
    const { userId, groupId } = req.body;

    const chat = await Chat.findById(groupId);

    const creatorId = chat.admin[0].toString();
    if (req.user.id !== creatorId) {
      return res
        .status(403)
        .json({ message: "Only the group creator can remove admins" });
    }

    if (userId === creatorId) {
      return res
        .status(400)
        .json({ message: "Cannot remove the group creator as an admin" });
    }

    if (!chat.admin.includes(req.user.id)) {
      return res
        .status(403)
        .json({ message: "Only group admins can remove admins" });
    }

    if (!chat.admin.includes(userId)) {
      return res.status(400).json({ message: "User is not an admin" });
    }

    chat.admin = chat.admin.filter((adminId) => adminId.toString() !== userId);
    await chat.save();

    // Emit admin removed event to group
    const io = getIO();
    io.to(groupId).emit("RemoveAdmin", { groupId, userId });

    res.json({ message: "Admin removed successfully", chat });
  } catch (error) {
    console.error("Remove Admin Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const adminAddUser = async (req, res) => {
  try {
    const { userId, groupId } = req.body;

    const chat = await Chat.findById(groupId);

    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ message: "Group chat not found" });
    }

    if (!chat.admin.includes(req.user.id)) {
      return res.status(403).json({ message: "Only group admins can add users" });
    }

    if (chat.participants.includes(userId)) {
      return res.status(400).json({ message: "User is already a participant" });
    }

    chat.participants.push(userId);
    await chat.save();

    // Emit user added event to group
    const io = getIO();
    io.to(groupId).emit("AdminAddUser", { groupId, userId });

    res.json({ message: "User added successfully", chat });
  } catch (error) {
    console.error("Admin Add User Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const adminRemoveUser = async (req, res) => {
  try {
    const { userId, groupId } = req.body;

    const chat = await Chat.findById(groupId);

    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ message: "Group chat not found" });
    }

    if (!chat.admin.includes(req.user.id)) {
      return res
        .status(403)
        .json({ message: "Only group admins can remove users" });
    }

    if (!chat.participants.includes(userId)) {
      return res.status(400).json({ message: "User is not a participant" });
    }

    chat.participants = chat.participants.filter(
      (participantId) => participantId.toString() !== userId,
    );

    chat.admin = chat.admin.filter((adminId) => adminId.toString() !== userId);

    await chat.save();

    // Auto-delete group if only one admin and no other users
    const deleted = await autoDeleteGroupIfEmpty(chat);
    if (deleted) {
      return res.json({ message: "Group deleted automatically as only one admin remained." });
    }

    // Emit user removed event to group
    const io = getIO();
    io.to(groupId).emit("AdminRemoveUser", { groupId, userId });

    res.json({ message: "User removed successfully", chat });
  } catch (error) {
    console.error("Admin Remove User Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const LeaveGroup = async (req, res) => {
  try {
    const { groupId } = req.body;

    const chat = await Chat.findById(groupId);

    if (!chat || !chat.isGroupChat) {
      console.error("[LeaveGroup] Group chat not found for groupId:", groupId);
      return res.status(404).json({ message: "Group chat not found" });
    }

    if (!Array.isArray(chat.participants) || !chat.participants.includes(req.user.id)) {
      return res.status(400).json({ message: "User is not a participant" });
    }

    // Remove user from participants and admin
    chat.participants = Array.isArray(chat.participants)
      ? chat.participants.filter(
          (participantId) => participantId && participantId.toString() !== req.user.id
        )
      : [];

    chat.admin = Array.isArray(chat.admin)
      ? chat.admin.filter(
          (adminId) => adminId && adminId.toString() !== req.user.id
        )
      : [];

    await chat.save();

    // Auto-delete group if only one admin and no other users
    const deleted = await autoDeleteGroupIfEmpty(chat);
    if (deleted) {
      return res.json({ message: "Group deleted automatically as only one admin remained." });
    }

    // Emit leave group event to group
    const io = getIO();
    io.to(groupId).emit("LeaveGroup", { groupId, userId: req.user.id });

    res.json({ message: "Left group successfully", chat });
  } catch (error) {
    console.error("Leave Group Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const chat = await Chat.findById(groupId);

    if (!chat || !chat.isGroupChat) {
      console.error("[deleteGroup] Group chat not found for groupId:", groupId);
      return res.status(404).json({ message: "Group chat not found" });
    }

    const creatorId = chat.admin[0].toString();
    if (req.user.id !== creatorId) {
      return res
        .status(403)
        .json({ message: "Only the group creator can delete the group" });
    }

    await Chat.findByIdAndDelete(groupId);
    await Message.deleteMany({ chatId: groupId });

    // Emit group deleted event to group
    const io = getIO();
    io.to(groupId).emit("DeleteGroup", { groupId });
    
    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Delete Group Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};