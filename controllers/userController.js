const User = require('../models/User');

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = async (req, res) => {
    try {
        // The 'protect' middleware already attaches the user object to the request.
        // We select '-password' to exclude the hashed password from the response.
        const user = await User.findById(req.user.id).select('-password');

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Update user onboarding information (path, location, or priorities)
 * @route   PUT /api/users/onboarding
 * @access  Private
 */
const updateOnboarding = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { path, location, priorities } = req.body;

        if (path) user.path = path;
        if (location) user.location = location;
        if (priorities) {
            user.priorities = priorities;
            user.onboardingComplete = true;
        }

        const updatedUser = await user.save();

        res.json({
            message: 'Onboarding information updated successfully.',
            user: {
                _id: updatedUser._id,
                path: updatedUser.path,
                location: updatedUser.location,
                priorities: updatedUser.priorities,
                onboardingComplete: updatedUser.onboardingComplete
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Mark a user's priority as complete
 * @route   PUT /api/users/priorities/complete
 * @access  Private
 */
const completePriority = async (req, res) => {
    try {
        const { priority } = req.body;
        if (!priority) {
            return res.status(400).json({ message: 'Priority is required.' });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.priorities.includes(priority)) {
            return res.status(400).json({ message: 'This priority is not on your list.' });
        }

        if (user.completedPriorities.includes(priority)) {
            return res.status(400).json({ message: 'This priority has already been completed.' });
        }

        user.completedPriorities.push(priority);
        await user.save();

        res.json({
            message: `'${priority}' marked as complete.`,
            completedPriorities: user.completedPriorities
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Export all the functions so they can be used in your routes
module.exports = {
    getUserProfile,
    updateOnboarding,
    completePriority
};
