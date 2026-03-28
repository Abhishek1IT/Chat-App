import express from "express";
import { forgotPassword, resetPassword } from "../controllers/forgotpassController.js";

const router = express.Router();

router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:token", resetPassword);

export default router;