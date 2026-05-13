import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { registerSchema, loginSchema } from "../utils/validationSchemas.js";
import logger from "../utils/logger.js";

export const register = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { username, email, password, gender, interests = [], bio = "" } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      gender,
      interests,
      bio,
    });

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      message: "Registration successful",
      token,
      user,
    });
  } catch (error) {
    logger.error("Registration error", { error: error.message, stack: error.stack });
    res.status(500).json({
      message: "Registration failed",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    logger.error("Login error", { error: error.message, stack: error.stack });
    res.status(500).json({
      message: "Login failed",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, email, gender, interests, bio } = req.body;

    // Check if username or email is taken by another user
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username or email already taken" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { username, email, gender, interests, bio },
      { new: true }
    );

    logger.info("Profile updated", { userId: req.user._id });

    res.json({ user: updatedUser });
  } catch (error) {
    logger.error("Profile update error", { error: error.message, stack: error.stack });
    res.status(500).json({ message: "Update failed" });
  }
};

export const promoteToAdmin = async (req, res) => {
  try {
    const { userId, adminKey } = req.body;

    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({ message: "Invalid admin key" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = "admin";
    await user.save();

    logger.info("User promoted to admin", { userId });

    res.json({ message: "User promoted to admin" });
  } catch (error) {
    logger.error("Promote admin error", { error: error.message });
    res.status(500).json({ message: "Promotion failed" });
  }
};

export const verifyAdminKey = async (req, res) => {
  try {
    const { adminKey } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin role required" });
    }

    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({ message: "Invalid admin key" });
    }

    res.json({ message: "Admin key validated" });
  } catch (error) {
    logger.error("Admin key validation error", { error: error.message, stack: error.stack });
    res.status(500).json({ message: "Validation failed" });
  }
};