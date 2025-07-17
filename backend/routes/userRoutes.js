import express from 'express';
import {
    loginUser,
    registerUser,
    getMe,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private route - requires a valid token
// The 'protect' middleware will run first, then 'getMe'
router.route('/me').get(protect, getMe);

export default router;