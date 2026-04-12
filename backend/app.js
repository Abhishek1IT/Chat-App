import express from "express";
import authRoutes from "./routes/authRoute.js";
import sendMessageRoutes from "./routes/sendmessageRoute.js";
import forgotPassRoutes from "./routes/frogotPassRoute.js";
import chatRoutes from "./routes/chatRoute.js";
import botRoutes from "./routes/botRoute.js";
import userRoutes from "./routes/userRoute.js";
import path from "path";
import cors from "cors";

const app = express();
app.use(cors({
  origin: ["http://localhost:3000", "http://192.168.239.125:3000"],
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/messages", sendMessageRoutes);
app.use("/api/password", forgotPassRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/bot", botRoutes);
app.use("/api/users", userRoutes);

app.get("/", (_req, res) => {
  res.status(200).json({ message: "Chat API is running" });
});

export default app;