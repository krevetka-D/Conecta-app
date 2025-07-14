// controllers/forumController.js
const Forum = require('../models/Forum');
const Thread = require('../models/Thread');
const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Get recommended forums based on user profile
// @route   GET /api/forums/recommended
const getRecommendedForums = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.path) {
            return res.status(400).json({ message: 'User profile is not complete' });
        }

        const userLocationTag = user.location ? user.location.toLowerCase().replace(/\s+/g, '-') : '';

        const studentTags = [`#student-life-${userLocationTag}`, '#spanish-banking', `#housing-${userLocationTag}`, '#documents-help-students'];
        const jobSeekerTags = ['#work-and-taxes-spain', '#visas-and-work-permits', '#networking-spain'];

        const recommendedTags = user.path === 'International Student' ? studentTags : jobSeekerTags;

        // This part is a placeholder. You would need to pre-populate your DB with forums.
        const forums = await Forum.find({ tag: { $in: recommendedTags } });

        res.json(forums);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// NOTE: You would add more functions here for creating threads, posts, etc.

// This line makes the functions available to other files
module.exports = { getRecommendedForums };