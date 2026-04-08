import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.0-flash";

let model = null;
if (GEMINI_API_KEY) {
	const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
	model = genAI.getGenerativeModel({ model: MODEL_NAME });
}

export async function botController(msg) {
	const text = String(msg || "").trim();

	if (!text) {
		return "Please type a message so I can respond.";
	}

	if (!model) {
		return "AI is not configured. Add GEMINI_API_KEY in backend/.env.";
	}

	try {
		const result = await model.generateContent([
			{
				text: "You are a helpful chatbot. Keep answers concise and clear.",
			},
			{
				text,
			},
		]);

		const reply = result.response.text().trim() || "I could not generate a response.";
		return reply;
	} catch (error) {
		// Log full error for debugging
		console.error("Gemini API Error (full):", error);
		if (error && error.message) {
			console.error("Gemini API Error (message):", error.message);
		}
		// Always return fallback error message
		return "Sorry, I could not process that right now. Please try again.";
	}
}

// Express handler for botRoute.js
export async function handleBotMessage(req, res) {
	try {
		const { message } = req.body;
		const reply = await botController(message);
		res.json({ reply });
	} catch (error) {
		res.status(500).json({ reply: "Bot error. Please try again." });
	}
}