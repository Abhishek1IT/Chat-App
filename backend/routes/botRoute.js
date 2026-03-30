import express from "express";
import { handleBotMessage } from "../controllers/botController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/message", protect, handleBotMessage);

export default router;