import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    isGroupChat: {
      type: Boolean,
      default: false,
    },

    name: {
      type: String,
      trim: true,
    },

    admin: [
      {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      },
    ],

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    lastMessageText: {
      type: String,
      default: "",
    },

    lastMessageTime: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);