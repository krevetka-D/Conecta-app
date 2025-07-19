
import express from 'express';
import { 
    getForums, 
    createForum, 
    getForum, 
    deleteForum,
    createThread, 
    deleteThread,
    createPost,
    getThreads 
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

// Forum detail routes
router.route('/:id')
    .get(cacheMiddleware('short'), getForum)
    .delete(protect, deleteForum);

// Thread routes with pagination
router.route('/:id/threads')
    .get(cacheMiddleware('short'), getThreads)
    .post(
        protect,
        forumValidationRules.createThread,
        handleValidationErrors,
        createThread
    );

// Post routes
router.route('/threads/:threadId/posts')
    .post(
        protect,
        forumValidationRules.createPost,
        handleValidationErrors,
        createPost
    );

// Thread management
router.route('/threads/:threadId')
    .delete(protect, deleteThread);

export default router;