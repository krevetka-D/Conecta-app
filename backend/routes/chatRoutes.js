import express from 'express';
import {
    getRoomMessages,
    getChatRooms,
    searchMessages
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All chat routes require authentication
router.use(protect);

// Chat room routes
router.get('/rooms', getChatRooms);
router.get('/rooms/:roomId/messages', getRoomMessages);

// Search
router.get('/search', searchMessages);

export default router;