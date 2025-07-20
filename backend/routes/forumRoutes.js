import express from 'express';
import { 
    getForums, 
    createForum, 
    getForum, 
    deleteForum,
    searchForums,
    getMyForums,
    updateForum
} from '../controllers/forumController.js';
import { protect } from '../middleware/authMiddleware.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';
import { forumValidationRules, handleValidationErrors } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Public routes with caching
router.route('/')
    .get(cacheMiddleware('medium'), getForums)
    .post(
        protect, 
        forumValidationRules.createForum,
        handleValidationErrors,
        createForum
    );

// Search route
router.get('/search', searchForums);

// User's forums route (must be before /:id to avoid conflicts)
router.get('/my-rooms', protect, getMyForums);

// Forum detail routes
router.route('/:id')
    .get(cacheMiddleware('short'), getForum)
    .put(protect, updateForum)
    .delete(protect, deleteForum);

export default router;