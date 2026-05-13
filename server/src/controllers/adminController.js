import User from "../models/User.js";
import Report from "../models/Report.js";

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const maleUsers = await User.countDocuments({ gender: "male" });
    const femaleUsers = await User.countDocuments({ gender: "female" });
    const otherUsers = await User.countDocuments({ gender: "other" });
    const premiumUsers = await User.countDocuments({ premium: true });
    const verifiedUsers = await User.countDocuments({ verified: true });

    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: "pending" });
    const reviewedReports = await Report.countDocuments({ status: "reviewed" });
    const resolvedReports = await Report.countDocuments({ status: "resolved" });

    res.json({
      totalUsers,
      maleUsers,
      femaleUsers,
      otherUsers,
      premiumUsers,
      verifiedUsers,
      totalReports,
      pendingReports,
      reviewedReports,
      resolvedReports,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate(
        "reporterUserId",
        "username email gender role isBanned bannedReason"
      )
      .populate(
        "reportedUserId",
        "username email gender role isBanned bannedReason"
      )
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "reviewed", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid report status" });
    }

    const report = await Report.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({
      message: "Report updated successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByIdAndDelete(id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      {
        isBanned: true,
        bannedReason: reason || "Banned by admin",
        bannedAt: new Date(),
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User banned successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unbanUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      {
        isBanned: false,
        bannedReason: "",
        bannedAt: null,
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User unbanned successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const banUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const { reason } = req.body;

    const user = await User.findOneAndUpdate(
      { username },
      {
        isBanned: true,
        bannedReason: reason || "Banned by admin",
        bannedAt: new Date(),
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: `User "${username}" not found`,
      });
    }

    res.json({
      message: "User banned successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unbanUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOneAndUpdate(
      { username },
      {
        isBanned: false,
        bannedReason: "",
        bannedAt: null,
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: `User "${username}" not found`,
      });
    }

    res.json({
      message: "User unbanned successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};