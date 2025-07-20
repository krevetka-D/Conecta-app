import express from 'express';
import { getDashboardEvents, getDashboardOverview } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = express.Router();

// Route for fetching complete dashboard overview
router.route('/overview')
    .get(
        protect, 
        cacheMiddleware('short'), // Cache for 1 minute
        getDashboardOverview
    );

// Route for fetching dashboard events
router.route('/events')
    .get(
        protect, 
        cacheMiddleware('short'), 
        getDashboardEvents
    );

export default router;