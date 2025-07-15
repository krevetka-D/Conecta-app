import express from 'express';
import {
    registerUser,
    loginUser,
    getMe,
    updateOnboarding,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// --- Standard User Routes ---
router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// --- Onboarding Route ---
router.put('/onboarding', protect, updateOnboarding);

// --- Admin Test Route ---
// A temporary route to verify that the admin middleware works correctly
router.get('/admin-check', protect, admin, (req, res) => {
    res.status(200).json({ message: 'Success! You have admin privileges.' });
});

export default router;