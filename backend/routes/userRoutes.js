import express from 'express';
import {
    loginUser,
    registerUser,
    getMe,
    updateProfessionalPath,
    completeOnboarding,
    getOnboardingStatus,
    updateProfile,
    logoutUser
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

// Onboarding routes
router.get('/onboarding-status', protect, getOnboardingStatus);
router.put('/professional-path', protect, updateProfessionalPath);
router.put('/complete-onboarding', protect, completeOnboarding);

// Profile update
router.put('/profile', protect, updateProfile);

// Logout endpoint
router.post('/logout', protect, logoutUser);

export default router;