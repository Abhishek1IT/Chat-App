import express from "express";

import { 
    getAllUsers,
    deleteUser,
    getAllUsersWithLastMessage,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/all", protect, getAllUsers);
router.get("/all-with-last-message", protect, getAllUsersWithLastMessage);
router.delete("/delete/:id", protect, deleteUser);

export default router;