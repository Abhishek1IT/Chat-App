import mongoose from "mongoose";

const chatbotSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isBot: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const Chatbot = mongoose.model("Chatbot", chatbotSchema);

export default Chatbot;
