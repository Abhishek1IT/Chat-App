import express from "express";
import {
  accessChat,
  getMyChats,
  getChatMessages
} from "../controllers/chatController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/access", protect, accessChat);
router.get("/my", protect, getMyChats);
router.get("/:userId", protect, getChatMessages);

export default router;