// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
    savePath,
    saveLocation,
    savePriorities,
    completePriority
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.put('/onboarding/path', protect, savePath);
router.put('/onboarding/location', protect, saveLocation);
router.put('/onboarding/priorities', protect, savePriorities);
router.put('/priorities/complete', protect, completePriority);

module.exports = router;