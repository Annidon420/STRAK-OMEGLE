import express from "express";

import {
  getAdminStats,
  getReports,
  updateReportStatus,
  deleteReport,
  banUser,
  unbanUser,
  banUserByUsername,
  unbanUserByUsername,
} from "../controllers/adminController.js";
import { authenticateToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth and admin check to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

router.get("/stats", getAdminStats);
router.get("/reports", getReports);

router.patch("/reports/:id/status", updateReportStatus);
router.delete("/reports/:id", deleteReport);

router.patch("/users/:id/ban", banUser);
router.patch("/users/:id/unban", unbanUser);

router.patch("/users/username/:username/ban", banUserByUsername);
router.patch("/users/username/:username/unban", unbanUserByUsername);

export default router;