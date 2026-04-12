import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      trim: true,
    },

    messageType: {
      type: String,
      enum: ["text", "file"],
      default: "text",
    },

    fileUrl: {
      type: String,
      default: "",
    },
    mimetype: {
      type: String,
      default: "",
    },


    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },

    deliveredTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    }],
    seenBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    }],
    
    isedited: {
      type: Boolean,
      default: false,
    },
    deletedFor: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    }],

  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;