import express from "express";
import { sendMessage, markAsSeen } from "../controllers/sendMessageController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../uploads/upload.js";

const router = express.Router();

router.post("/send", protect, upload.single("file"), sendMessage);
router.put("/seen", protect, markAsSeen);

export default router;