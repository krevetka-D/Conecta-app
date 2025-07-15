import express from 'express';
import { getForums, createForum, getForum, createThread, createPost } from '../controllers/forumController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getForums).post(protect, createForum);
router.route('/threads/:threadId/posts').post(protect, createPost);
router.route('/:id/threads').post(protect, createThread);
router.route('/:id').get(getForum);

export default router;