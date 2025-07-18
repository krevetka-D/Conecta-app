// backend/routes/userRoutes.js
import express from 'express';
import {
    loginUser,
    registerUser,
    getMe,
    updateOnboarding,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validationRules, handleValidationErrors } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register',
    validationRules.register,
    handleValidationErrors,
    registerUser
);

router.post('/login',
    validationRules.login,
    handleValidationErrors,
    loginUser
);

// Private routes - requires a valid token
router.route('/me').get(protect, getMe);

// Update onboarding - CRITICAL: This was missing
router.put('/onboarding', protect, updateOnboarding);

// Logout endpoint (for token invalidation if needed)
router.post('/logout', protect, (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

export default router;