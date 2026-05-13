import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporterUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reporterUsername: {
      type: String,
      default: "Unknown User",
    },

    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reportedUsername: {
      type: String,
      default: "Stranger",
    },

    reporterSocket: {
      type: String,
      default: "",
    },

    reportedSocket: {
      type: String,
      default: "",
    },

    roomId: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Indexes for performance
reportSchema.index({ status: 1 });
reportSchema.index({ reportedUserId: 1 });
reportSchema.index({ createdAt: -1 });

const Report = mongoose.model("Report", reportSchema);

export default Report;