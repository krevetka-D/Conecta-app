const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    updateOnboarding,
    completePriority
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get the profile of the currently logged-in user
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, getUserProfile);

// @desc    Update user onboarding data (path, location, priorities)
// @route   PUT /api/users/onboarding
// @access  Private
router.put('/onboarding', protect, updateOnboarding);

// @desc    Mark one of the user's priorities as complete
// @route   PUT /api/users/priorities/complete
// @access  Private
router.put('/priorities/complete', protect, completePriority);

module.exports = router;
