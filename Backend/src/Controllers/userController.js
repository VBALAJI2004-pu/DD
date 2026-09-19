import User from "../Models/userModel.js";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('-password')
      .sort({ createdAt: -1 });
    
    // Add full URL for profile pictures
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? `https://${req.get('host')}` 
      : `http://localhost:${process.env.PORT || 5000}`;
    
    const usersWithUrls = users.map(user => {
      const userObj = user.toJSON();
      if (userObj.profilePicture) {
        userObj.profilePictureUrl = `${baseUrl}/uploads/${userObj.profilePicture}`;
      }
      return userObj;
    });
    
    res.status(200).json({
      success: true,
      users: usersWithUrls,
      count: usersWithUrls.length
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message
    });
  }
};

// Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message
    });
  }
};

// Create new user
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if active user already exists (exclude soft-deleted users)
    const existingUser = await User.findOne({ 
      email: email.toLowerCase().trim(), 
      isActive: true 
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }
    
    // Handle profile picture upload
    let profilePicture = null;
    if (req.file) {
      profilePicture = req.file.filename;
    }
    
    // Create new user
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'staff',
      profilePicture
    };
    
    const user = new User(userData);
    await user.save();
    
    // Return user without password
    const userResponse = user.toJSON();
    
    // Add full URL for profile picture if it exists
    if (userResponse.profilePicture) {
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? `https://${req.get('host')}` 
        : `http://localhost:${process.env.PORT || 5000}`;
      userResponse.profilePictureUrl = `${baseUrl}/uploads/${userResponse.profilePicture}`;
    }
    
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: userResponse
    });
  } catch (error) {
    console.error("Error creating user:", error);
    
    // Delete uploaded file if user creation fails
    if (req.file) {
      const filePath = path.join(process.cwd(), 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(400).json({
      success: false,
      message: "Failed to create user",
      error: error.message
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    
    // Find user
    const user = await User.findById(id);
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Check if email is being changed and if it's already taken by an active user
    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase().trim(), 
        isActive: true,
        _id: { $ne: id }
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email is already taken by another user"
        });
      }
    }
    
    // Check if trying to change role from admin when it's the last admin
    if (role && user.role === "admin" && role !== "admin") {
      const adminCount = await User.countDocuments({ 
        role: "admin", 
        isActive: true 
      });
      
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot change role of the last administrator. At least one administrator must remain."
        });
      }
    }
    
    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (role) updateData.role = role;
    
    // Handle password update
    if (password && password.trim()) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long"
        });
      }
      const salt = await bcrypt.genSalt(12);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    // Handle profile picture update
    if (req.file) {
      // Delete old profile picture if exists
      if (user.profilePicture) {
        const oldFilePath = path.join(process.cwd(), 'uploads', user.profilePicture);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      updateData.profilePicture = req.file.filename;
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    // Add full URL for profile picture if it exists
    const userResponse = updatedUser.toJSON();
    if (userResponse.profilePicture) {
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? `https://${req.get('host')}` 
        : `http://localhost:${process.env.PORT || 5000}`;
      userResponse.profilePictureUrl = `${baseUrl}/uploads/${userResponse.profilePicture}`;
    }
    
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: userResponse
    });
  } catch (error) {
    console.error("Error updating user:", error);
    
    // Delete uploaded file if update fails
    if (req.file) {
      const filePath = path.join(process.cwd(), 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(400).json({
      success: false,
      message: "Failed to update user",
      error: error.message
    });
  }
};

// Delete user (soft delete) - Protect last admin
export const deleteUser = async (req, res) => {
  try {
    console.log(`🗑️ deleteUser called with ID: ${req.params.id}`);
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log(`❌ Invalid user ID format: ${id}`);
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }
    
    const user = await User.findById(id);
    console.log(`🔍 Found user:`, user ? `${user.email} (${user.role}) isActive: ${user.isActive}` : 'null');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user is already inactive
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: "User is already deleted"
      });
    }

    // Check if user is an administrator
    if (user.role === "admin") {
      // Count active administrators
      const adminCount = await User.countDocuments({ 
        role: "admin", 
        isActive: true 
      });
      
      console.log(`Admin count: ${adminCount}, Deleting admin: ${user.email}`);
      
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete the last administrator. At least one administrator must remain."
        });
      }
    }

    // Delete profile picture file if exists
    if (user.profilePicture) {
      const filePath = path.join(process.cwd(), 'uploads', user.profilePicture);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted profile picture: ${user.profilePicture}`);
      }
    }

    // Hard delete - permanently remove from database
    console.log(`💀 Permanently deleting user: ${user.email}`);
    const deleteResult = await User.findByIdAndDelete(id);
    console.log(`💀 Hard delete result:`, deleteResult ? `${deleteResult.email} permanently deleted` : 'No user deleted');

    // Re-fetch the list of active users to return to the client
    const users = await User.find({ isActive: true })
      .select('-password')
      .sort({ createdAt: -1 });
    
    // Add full URL for profile pictures
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? `https://${req.get('host')}` 
      : `http://localhost:${process.env.PORT || 5000}`;
    
    const usersWithUrls = users.map(user => {
      const userObj = user.toJSON();
      if (userObj.profilePicture) {
        userObj.profilePictureUrl = `${baseUrl}/uploads/${userObj.profilePicture}`;
      }
      return userObj;
    });

    res.status(200).json({
      success: true,
      message: "User permanently deleted from database",
      users: usersWithUrls
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message
    });
  }
};

// Hard delete user (permanently remove from database)
export const hardDeleteUser = async (req, res) => {
  try {
    console.log(`💀 hardDeleteUser called with ID: ${req.params.id}`);
    const { id } = req.params;
    
    // Find user
    const user = await User.findById(id);
    console.log(`🔍 Found user for hard delete:`, user ? `${user.email} (${user.role}) isActive: ${user.isActive}` : 'null');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Delete profile picture file if exists
    if (user.profilePicture) {
      const filePath = path.join(process.cwd(), 'uploads', user.profilePicture);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted profile picture: ${user.profilePicture}`);
      }
    }
    
    // Permanently delete user
    const deleteResult = await User.findByIdAndDelete(id);
    console.log(`💀 Hard delete result:`, deleteResult ? `${deleteResult.email} permanently deleted` : 'No user deleted');
    
    res.status(200).json({
      success: true,
      message: "User permanently deleted"
    });
  } catch (error) {
    console.error("Error hard deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user permanently",
      error: error.message
    });
  }
};

// Toggle user active status
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: user.toJSON()
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle user status",
      error: error.message
    });
  }
};

// Get users by role
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    if (!['staff', 'accountant', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be staff, accountant, or admin"
      });
    }
    
    const users = await User.find({ role, isActive: true })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      users,
      count: users.length,
      role
    });
  } catch (error) {
    console.error("Error fetching users by role:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users by role",
      error: error.message
    });
  }
};

// Debug endpoint to check all users in database
export const debugAllUsers = async (req, res) => {
  try {
    console.log('🔍 Fetching ALL users from database for debugging...');
    
    // Get all users including soft-deleted ones
    const allUsers = await User.find({}).select('email role isActive createdAt');
    const activeUsers = allUsers.filter(user => user.isActive);
    const inactiveUsers = allUsers.filter(user => !user.isActive);
    
    console.log(`📊 Database Status:`);
    console.log(`   Total users: ${allUsers.length}`);
    console.log(`   Active users: ${activeUsers.length}`);
    console.log(`   Inactive users: ${inactiveUsers.length}`);
    
    console.log(`📋 All users:`);
    allUsers.forEach(user => {
      console.log(`   ${user.email} (${user.role}) - isActive: ${user.isActive}`);
    });
    
    res.status(200).json({
      success: true,
      totalUsers: allUsers.length,
      activeUsers: activeUsers.length,
      inactiveUsers: inactiveUsers.length,
      users: allUsers.map(user => ({
        id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error("Error fetching debug users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users for debugging",
      error: error.message
    });
  }
};

// Clean up soft-deleted users (permanently remove them)
export const cleanupSoftDeletedUsers = async (req, res) => {
  try {
    console.log('🧹 Starting cleanup of soft-deleted users...');
    
    // Find all soft-deleted users
    const softDeletedUsers = await User.find({ isActive: false });
    console.log(`Found ${softDeletedUsers.length} soft-deleted users`);
    
    let deletedCount = 0;
    let errors = [];
    
    for (const user of softDeletedUsers) {
      try {
        // Delete profile picture file if exists
        if (user.profilePicture) {
          const filePath = path.join(process.cwd(), 'uploads', user.profilePicture);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted profile picture: ${user.profilePicture}`);
          }
        }
        
        // Permanently delete user from database
        await User.findByIdAndDelete(user._id);
        console.log(`Permanently deleted user: ${user.email}`);
        deletedCount++;
      } catch (error) {
        console.error(`Error deleting user ${user.email}:`, error.message);
        errors.push({ email: user.email, error: error.message });
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Cleanup completed. ${deletedCount} users permanently deleted.`,
      deletedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("Error during cleanup:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cleanup soft-deleted users",
      error: error.message
    });
  }
};
