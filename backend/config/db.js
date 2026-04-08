import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is missing in .env");
    }

    const conn = await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); 
  }
};

export default connectDB;