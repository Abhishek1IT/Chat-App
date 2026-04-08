import express from "express";
import { 
    sendMessage, 
    markAsSeen, 
    editMessage, 
    deleteMessage, 
                } from "../controllers/sendMessageController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../uploads/upload.js";

const router = express.Router();

router.post("/send", protect, upload.single("file"), sendMessage);
router.put("/seen", protect, markAsSeen);
router.patch("/edit/:id", protect, editMessage);
router.delete("/delete/:id", protect, deleteMessage);

export default router;