import express from "express";
import {
  register,
  login,
  updateProfile,
  promoteToAdmin,
  verifyAdminKey,
} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put("/profile", authenticateToken, updateProfile);
router.post("/promote-admin", promoteToAdmin);
router.post("/verify-admin-key", authenticateToken, verifyAdminKey);

export default router;