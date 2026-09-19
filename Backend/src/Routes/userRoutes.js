import express from 'express';
import { authenticateToken } from '../MIddlewares/authMiddleware.js';
import { requireAdmin } from '../MIddlewares/roleMiddleware.js';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  hardDeleteUser,
  toggleUserStatus,
  getUsersByRole,
  debugAllUsers,
  cleanupSoftDeletedUsers
} from '../Controllers/userController.js';
import multer from "multer";
import path from "path";

const router = express.Router();

// Multer config for profile picture uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("./uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Routes - All protected with authentication and admin role
// GET /api/users - Get all active users
router.get("/", authenticateToken, requireAdmin, getUsers);

// GET /api/users/role/:role - Get users by role
router.get("/role/:role", authenticateToken, requireAdmin, getUsersByRole);

// GET /api/users/:id - Get single user by ID
router.get("/:id", authenticateToken, requireAdmin, getUserById);

// POST /api/users - Create new user
router.post("/", authenticateToken, requireAdmin, upload.single('profilePicture'), createUser);

// PUT /api/users/:id - Update user
router.put("/:id", authenticateToken, requireAdmin, upload.single('profilePicture'), updateUser);

// DELETE /api/users/:id - Soft delete user
router.delete("/:id", authenticateToken, requireAdmin, deleteUser);

// DELETE /api/users/:id/hard - Hard delete user
router.delete("/:id/hard", authenticateToken, requireAdmin, hardDeleteUser);

// PATCH /api/users/:id/toggle-status - Toggle user active status
router.patch("/:id/toggle-status", authenticateToken, requireAdmin, toggleUserStatus);

// GET /api/users/debug - Debug endpoint to see all users in database
router.get("/debug", authenticateToken, requireAdmin, debugAllUsers);

// POST /api/users/cleanup - Clean up soft-deleted users (permanently remove them)
router.post("/cleanup", authenticateToken, requireAdmin, cleanupSoftDeletedUsers);

export default router;
