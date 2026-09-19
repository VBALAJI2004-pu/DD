import express from "express";
import { loginUser, getCurrentUser, logoutUser } from "../Controllers/authController.js";
import { authenticateToken } from "../MIddlewares/authMiddleware.js";
import User from "../Models/userModel.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// POST /api/auth/login - User login
router.post("/login", loginUser);

// GET /api/auth/me - Get current user profile (protected)
router.get("/me", authenticateToken, getCurrentUser);

// POST /api/auth/logout - User logout
router.post("/logout", authenticateToken, logoutUser);

// POST /api/auth/seed-admin - Create admin user (temporary endpoint)
router.post("/seed-admin", async (req, res) => {
  try {
    console.log('Creating admin user...');
    
    // Remove existing admin user
    const deleteResult = await User.deleteMany({ email: 'vikram517879@gmail.com' });
    console.log('Deleted existing users:', deleteResult.deletedCount);
    
    // Create admin user using the model (which will auto-hash password)
    const adminUser = new User({
      name: 'Vikram',
      email: 'vikram517879@gmail.com',
      password: 'ttdemo123', // Will be hashed by pre-save middleware
      role: 'admin',
      isActive: true,
      profilePicture: null
    });

    const savedUser = await adminUser.save();
    console.log('Admin user saved:', savedUser._id);
    
    // Test the password
    const testUser = await User.findOne({ email: 'vikram517879@gmail.com' });
    const isPasswordValid = await bcrypt.compare('ttdemo123', testUser.password);
    console.log('Password test result:', isPasswordValid);
    
    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        isActive: savedUser.isActive
      },
      credentials: {
        email: 'vikram517879@gmail.com',
        password: 'ttdemo123'
      },
      passwordTest: isPasswordValid ? 'VALID' : 'INVALID'
    });
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user',
      error: error.message,
      stack: error.stack
    });
  }
});

export default router;
