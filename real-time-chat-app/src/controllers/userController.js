// src/controllers/userController.js

const User = require('../models/User');
const redisService = require('../services/redisService');
const fileService = require('../services/fileService');

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('contacts', 'username email profilePicture status isOnline lastSeen');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const { username, status, bio } = req.body;
    const userId = req.user.id;

    // Check if username is already taken
    if (username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (status) updateData.status = status;
    if (bio !== undefined) updateData.bio = bio;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

/**
 * Upload profile picture
 */
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    // Delete old profile picture if exists
    if (user.profilePicture) {
      await fileService.deleteFile(user.profilePicture);
    }

    // Save new profile picture path
    const profilePicturePath = `/uploads/images/${req.file.filename}`;
    user.profilePicture = profilePicturePath;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: profilePicturePath
      }
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading profile picture',
      error: error.message
    });
  }
};

/**
 * Search users by username or email
 */
const searchUsers = async (req, res) => {
  try {
    const { query, page = 1, limit = 20 } = req.query;
    const currentUserId = req.user.id;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchRegex = new RegExp(query, 'i');
    const skip = (page - 1) * limit;

    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { username: searchRegex },
        { email: searchRegex }
      ]
    })
      .select('username email profilePicture status isOnline lastSeen')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments({
      _id: { $ne: currentUserId },
      $or: [
        { username: searchRegex },
        { email: searchRegex }
      ]
    });

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching users',
      error: error.message
    });
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('username email profilePicture status isOnline lastSeen bio');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

/**
 * Add contact
 */
const addContact = async (req, res) => {
  try {
    const { contactId } = req.body;
    const userId = req.user.id;

    if (userId === contactId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add yourself as contact'
      });
    }

    const contact = await User.findById(contactId);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = await User.findById(userId);

    // Check if already a contact
    if (user.contacts.includes(contactId)) {
      return res.status(400).json({
        success: false,
        message: 'User already in contacts'
      });
    }

    user.contacts.push(contactId);
    await user.save();

    const populatedUser = await User.findById(userId)
      .populate('contacts', 'username email profilePicture status isOnline lastSeen');

    res.status(200).json({
      success: true,
      message: 'Contact added successfully',
      data: populatedUser.contacts
    });
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding contact',
      error: error.message
    });
  }
};

/**
 * Remove contact
 */
const removeContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user.contacts.includes(contactId)) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    user.contacts = user.contacts.filter(
      id => id.toString() !== contactId
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Contact removed successfully'
    });
  } catch (error) {
    console.error('Remove contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing contact',
      error: error.message
    });
  }
};

/**
 * Get user contacts
 */
const getContacts = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate('contacts', 'username email profilePicture status isOnline lastSeen');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Enrich with online status from Redis
    const contactsWithStatus = await Promise.all(
      user.contacts.map(async (contact) => {
        const isOnline = await redisService.isUserOnline(contact._id.toString());
        return {
          ...contact.toObject(),
          isOnline
        };
      })
    );

    res.status(200).json({
      success: true,
      data: contactsWithStatus
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contacts',
      error: error.message
    });
  }
};

/**
 * Update user status (online/offline)
 */
const updateUserStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;
    const userId = req.user.id;

    const updateData = {
      isOnline,
      lastSeen: new Date()
    };

    await User.findByIdAndUpdate(userId, updateData);

    // Update Redis cache
    if (isOnline) {
      await redisService.setUserOnline(userId);
    } else {
      await redisService.setUserOffline(userId);
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully'
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
};

/**
 * Get online users from contacts
 */
const getOnlineContacts = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate('contacts', 'username email profilePicture status');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Filter online contacts using Redis
    const onlineContacts = [];
    for (const contact of user.contacts) {
      const isOnline = await redisService.isUserOnline(contact._id.toString());
      if (isOnline) {
        onlineContacts.push(contact);
      }
    }

    res.status(200).json({
      success: true,
      data: onlineContacts
    });
  } catch (error) {
    console.error('Get online contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching online contacts',
      error: error.message
    });
  }
};

/**
 * Block user
 */
const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (currentUserId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot block yourself'
      });
    }

    const user = await User.findById(currentUserId);

    if (!user.blockedUsers) {
      user.blockedUsers = [];
    }

    if (user.blockedUsers.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User already blocked'
      });
    }

    user.blockedUsers.push(userId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User blocked successfully'
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error blocking user',
      error: error.message
    });
  }
};

/**
 * Unblock user
 */
const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const user = await User.findById(currentUserId);

    if (!user.blockedUsers || !user.blockedUsers.includes(userId)) {
      return res.status(404).json({
        success: false,
        message: 'User not in blocked list'
      });
    }

    user.blockedUsers = user.blockedUsers.filter(
      id => id.toString() !== userId
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User unblocked successfully'
    });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unblocking user',
      error: error.message
    });
  }
};

/**
 * Get blocked users
 */
const getBlockedUsers = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate('blockedUsers', 'username email profilePicture');

    res.status(200).json({
      success: true,
      data: user.blockedUsers || []
    });
  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blocked users',
      error: error.message
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  searchUsers,
  getUserById,
  addContact,
  removeContact,
  getContacts,
  updateUserStatus,
  getOnlineContacts,
  blockUser,
  unblockUser,
  getBlockedUsers
};