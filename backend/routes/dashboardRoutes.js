import express from 'express';
import { getDashboardEvents } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route for fetching dashboard events. The 'protect' middleware ensures only logged-in users can access it.
router.route('/events').get(protect, getDashboardEvents);

export default router;