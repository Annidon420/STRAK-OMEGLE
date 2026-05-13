import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },

    interests: {
      type: [String],
      default: [],
    },

    bio: {
      type: String,
      maxLength: 200,
      default: "",
    },

    premium: {
      type: Boolean,
      default: false,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isBanned: {
      type: Boolean,
      default: false,
    },

    bannedReason: {
      type: String,
      default: "",
    },

    bannedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
userSchema.index({ role: 1 });
userSchema.index({ isBanned: 1 });

const User = mongoose.model("User", userSchema);

export default User;