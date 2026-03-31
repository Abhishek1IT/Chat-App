import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";
import initSocket from "./socket/socket.js";
import http from "http";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // http server 
    const server = http.createServer(app);

    // Socket attach 
    initSocket(server);

    // Start server
    server.listen(PORT, () => {
    });

    // Error handling
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use`);
      } else {
        console.error(`Server error: ${error.message}`);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();