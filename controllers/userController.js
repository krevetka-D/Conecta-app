// controllers/userController.js
const User = require('../models/User');

// @desc    Save user path from onboarding
// @route   PUT /api/users/onboarding/path
const savePath = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.path = req.body.path;
            await user.save();
            res.json({ message: 'Path saved successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Save user location from onboarding
// @route   PUT /api/users/onboarding/location
const saveLocation = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.location = req.body.location;
            await user.save();
            res.json({ message: 'Location saved successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Save user priorities and complete onboarding
// @route   PUT /api/users/onboarding/priorities
const savePriorities = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.priorities = req.body.priorities;
            user.onboardingComplete = true;
            await user.save();
            res.json({ message: 'Onboarding completed successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark a priority as complete
// @route   PUT /api/users/priorities/complete
const completePriority = async (req, res) => {
    try {
        const { priority } = req.body;
        const user = await User.findById(req.user.id);
        if (user && user.priorities.includes(priority) && !user.completedPriorities.includes(priority)) {
            user.completedPriorities.push(priority);
            await user.save();
            res.json({ message: `'${priority}' marked as complete.` });
        } else if (user) {
            res.status(400).json({ message: 'Priority already completed or is not on your list.' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// FIX: This line makes the functions available to your routes file
module.exports = {
    savePath,
    saveLocation,
    savePriorities,
    completePriority
};