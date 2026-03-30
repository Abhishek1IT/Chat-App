import User from "../models/User.js";
import generateToken from "../utils/genrateToken.js";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/sendEmail.js";

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    if (user) {
      res.status(201).json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isOnline: user.isOnline,
          lastseen: user.lastSeen
        },
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login a user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      
      // Send login notification email
      await sendEmail(
        user.email,
        "Login Notification",
        `Hello ${user.name},\n\nYou have successfully logged in to your account. If this wasn't you, please secure your account immediately.`
      );
      res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isOnline: user.isOnline,
          lastseen: user.lastSeen,
        },
        token: generateToken(user)
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Logged-in User Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};