import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import ChatMessage from '../models/ChatMessage.js';
import Forum from '../models/Forum.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * @desc    Get chat updates since last check
 * @route   GET /api/chat/updates
 * @access  Private
 */
router.get('/chat/updates', protect, async (req, res) => {
    try {
        const { since } = req.query;
        const sinceDate = since ? new Date(since) : new Date(Date.now() - 60000); // Default: last minute
        
        // Get user's forums
        const forums = await Forum.find({ isActive: true }).select('_id');
        const forumIds = forums.map(f => f._id);
        
        // Get new messages
        const messages = await ChatMessage.find({
            roomId: { $in: forumIds },
            createdAt: { $gt: sinceDate },
            deleted: false
        })
        .populate('sender', 'name email')
        .sort('-createdAt')
        .limit(50)
        .lean();
        
        const updates = messages.map(msg => ({
            event: 'new_message',
            data: {
                roomId: msg.roomId,
                message: msg,
                timestamp: msg.createdAt
            }
        }));
        
        res.json({ updates });
    } catch (error) {
        console.error('Polling error:', error);
        res.status(500).json({ updates: [] });
    }
});

/**
 * @desc    Get forum updates since last check
 * @route   GET /api/forums/updates
 * @access  Private
 */
router.get('/forums/updates', protect, async (req, res) => {
    try {
        const { since } = req.query;
        const sinceDate = since ? new Date(since) : new Date(Date.now() - 60000);
        
        // Get updated forums
        const forums = await Forum.find({
            isActive: true,
            updatedAt: { $gt: sinceDate }
        })
        .populate('user', 'name')
        .lean();
        
        const updates = forums.map(forum => ({
            event: 'forum_update',
            data: {
                type: 'update',
                forum
            }
        }));
        
        res.json({ updates });
    } catch (error) {
        console.error('Polling error:', error);
        res.status(500).json({ updates: [] });
    }
});

/**
 * @desc    Get user notifications/status updates
 * @route   GET /api/users/notifications
 * @access  Private
 */
router.get('/users/notifications', protect, async (req, res) => {
    try {
        const { since } = req.query;
        const sinceDate = since ? new Date(since) : new Date(Date.now() - 60000);
        
        // Get online status changes
        const users = await User.find({
            lastSeen: { $gt: sinceDate }
        })
        .select('_id name isOnline lastSeen')
        .lean();
        
        const updates = users.map(user => ({
            event: 'user_status_update',
            data: {
                userId: user._id,
                isOnline: user.isOnline,
                lastSeen: user.lastSeen
            }
        }));
        
        res.json({ updates });
    } catch (error) {
        console.error('Polling error:', error);
        res.status(500).json({ updates: [] });
    }
});

export default router;