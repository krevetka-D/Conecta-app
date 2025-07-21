import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getConversations,
    getMessages,
    sendMessage,
    markAsRead,
    startConversation,
    deleteConversation,
    getUserProfile,
    blockUser,
    unblockUser
} from '../controllers/messageControllers.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Conversation routes
router.get('/conversations', getConversations);
router.post('/conversations', startConversation);
router.delete('/conversations/:conversationId', deleteConversation);

// Message routes
router.get('/', getMessages);
router.post('/', sendMessage);
router.post('/read', markAsRead);

// User profile routes
router.get('/users/:userId/profile', getUserProfile);
router.post('/users/:userId/block', blockUser);
router.post('/users/:userId/unblock', unblockUser);

export default router;