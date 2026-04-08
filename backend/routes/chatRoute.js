import express from "express";
import {
  accessChat,
  groupChat,
  addAdmin,
  removeAdmin,
  adminAddUser,
  adminRemoveUser,
  LeaveGroup,
  getMyChats,
  getChatMessages,
  deleteGroup,
} from "../controllers/chatController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/access", protect, accessChat);
router.post("/group", protect, groupChat);
router.put("/addadmin", protect, addAdmin);
router.put("/removeadmin", protect, removeAdmin);
router.put("/adminadduser", protect, adminAddUser);
router.put("/adminremoveuser", protect, adminRemoveUser);
router.put("/leavegroup", protect, LeaveGroup);
router.get("/my", protect, getMyChats);
router.get("/:userId", protect, getChatMessages);
router.delete("/group/:groupId", protect, deleteGroup);

export default router;