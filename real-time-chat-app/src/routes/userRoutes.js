const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get current user profile
router.get('/profile', auth, userController.getProfile);

// Update user profile
router.put('/profile', auth, userController.updateProfile);

// Upload profile picture
router.post('/profile/picture', auth, upload.single('profilePicture'), userController.uploadProfilePicture);

// Search users
router.get('/search', auth, userController.searchUsers);

// Get user by ID
router.get('/:userId', auth, userController.getUserById);

// Add contact
router.post('/contacts/:userId', auth, userController.addContact);

// Remove contact
router.delete('/contacts/:userId', auth, userController.removeContact);

// Get contacts
router.get('/contacts', auth, userController.getContacts);

// Update user status
router.put('/status', auth, userController.updateUserStatus);

// Get online contacts
router.get('/contacts/online', auth, userController.getOnlineContacts);

// Block user
router.post('/block/:userId', auth, userController.blockUser);

// Unblock user
router.delete('/block/:userId', auth, userController.unblockUser);

// Get blocked users
router.get('/blocked', auth, userController.getBlockedUsers);

module.exports = router;
