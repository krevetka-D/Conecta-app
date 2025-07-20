import asyncHandler from 'express-async-handler';
import ChatMessage from '../models/ChatMessage.js';
import Forum from '../models/Forum.js';

/**
 * @desc    Get messages for a room
 * @route   GET /api/chat/rooms/:roomId/messages
 * @access  Private
 */
export const getRoomMessages = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const { limit = 50, before } = req.query;

    const query = { roomId, deleted: false };
    if (before) {
        query.createdAt = { $lt: before };
    }

    const messages = await ChatMessage.find(query)
        .populate('sender', 'name email')
        .populate('replyTo', 'content sender')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .lean();

    // Mark messages as read
    const messageIds = messages.map(m => m._id);
    await ChatMessage.updateMany(
        {
            _id: { $in: messageIds },
            'readBy.user': { $ne: req.user._id }
        },
        {
            $push: {
                readBy: {
                    user: req.user._id,
                    readAt: new Date()
                }
            }
        }
    );

    res.json(messages.reverse());
});

/**
 * @desc    Get chat rooms (forums) for user
 * @route   GET /api/chat/rooms
 * @access  Private
 */
export const getChatRooms = asyncHandler(async (req, res) => {
    const forums = await Forum.find({ isActive: true })
        .populate('user', 'name')
        .sort('-lastActivity')
        .lean();

    // Get unread count for each room
    const roomsWithUnread = await Promise.all(
        forums.map(async (forum) => {
            const unreadCount = await ChatMessage.countDocuments({
                roomId: forum._id,
                'readBy.user': { $ne: req.user._id }
            });

            // Get last message
            const lastMessage = await ChatMessage.findOne({ roomId: forum._id })
                .populate('sender', 'name')
                .sort('-createdAt')
                .lean();

            return {
                ...forum,
                unreadCount,
                lastMessage
            };
        })
    );

    res.json(roomsWithUnread);
});

/**
 * @desc    Search messages
 * @route   GET /api/chat/search
 * @access  Private
 */
export const searchMessages = asyncHandler(async (req, res) => {
    const { q, roomId } = req.query;

    if (!q) {
        return res.json([]);
    }

    const query = {
        content: { $regex: q, $options: 'i' },
        deleted: false
    };

    if (roomId) {
        query.roomId = roomId;
    }

    const messages = await ChatMessage.find(query)
        .populate('sender', 'name')
        .populate('roomId', 'title')
        .sort('-createdAt')
        .limit(50)
        .lean();

    res.json(messages);
});

export default {
    getRoomMessages,
    getChatRooms,
    searchMessages
};