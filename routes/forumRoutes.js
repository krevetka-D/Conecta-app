// routes/forumRoutes.js
const express = require('express');
const router = express.Router();
const { getRecommendedForums /*, other functions... */ } = require('../controllers/forumController');
const { protect } = require('../middleware/authMiddleware');

router.get('/recommended', protect, getRecommendedForums);
// Define other forum/thread/post routes here

module.exports = router;