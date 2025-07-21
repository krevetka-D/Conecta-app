import asyncHandler from 'express-async-handler';
import ChatMessage from '../models/ChatMessage.js';
import Forum from '../models/Forum.js';
import User from '../models/User.js';

/**
 * @desc    Get messages for a room with pagination
 * @route   GET /api/chat/rooms/:roomId/messages
 * @access  Private
 */
export const getRoomMessages = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const { limit = 50, before } = req.query;

    // Verify room exists
    const room = await Forum.findById(roomId);
    if (!room) {
        res.status(404);
        throw new Error('Room not found');
    }

    const query = { roomId, deleted: false };
    if (before) {
        query.createdAt = { $lt: new Date(before) };
    }

    const messages = await ChatMessage.find(query)
        .populate('sender', 'name email isOnline lastSeen')
        .populate({
            path: 'replyTo',
            select: 'content sender',
            populate: { 
                path: 'sender', 
                select: 'name' 
            }
        })
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

    res.json({
        messages: messages.reverse(),
        hasMore: messages.length === parseInt(limit),
        roomInfo: {
            id: room._id,
            title: room.title,
            description: room.description
        }
    });
});

/**
 * @desc    Send a message to a room
 * @route   POST /api/chat/rooms/:roomId/messages
 * @access  Private
 */
export const sendMessage = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const { content, type = 'text', attachments = [] } = req.body;

    // Validate input
    if (!content?.trim()) {
        res.status(400);
        throw new Error('Message content is required');
    }

    // Verify room exists
    const room = await Forum.findById(roomId);
    if (!room) {
        res.status(404);
        throw new Error('Room not found');
    }

    // Create message
    const message = await ChatMessage.create({
        roomId,
        sender: req.user._id,
        content: content.trim(),
        type,
        attachments,
        readBy: [{ user: req.user._id, readAt: new Date() }]
    });

    // Populate for response
    const populatedMessage = await ChatMessage.findById(message._id)
        .populate('sender', 'name email isOnline lastSeen')
        .populate({
            path: 'replyTo',
            select: 'content sender',
            populate: { path: 'sender', select: 'name' }
        })
        .lean();

    // Update forum activity
    await Forum.findByIdAndUpdate(roomId, {
        lastActivity: new Date()
    });

    res.status(201).json(populatedMessage);
});

/**
 * @desc    Get chat rooms (forums) for user with online status
 * @route   GET /api/chat/rooms
 * @access  Private
 */
export const getChatRooms = asyncHandler(async (req, res) => {
    const forums = await Forum.find({ isActive: true })
        .populate('user', 'name')
        .sort('-lastActivity')
        .lean();

    // Get additional info for each room
    const roomsWithInfo = await Promise.all(
        forums.map(async (forum) => {
            // Get unread count
            const unreadCount = await ChatMessage.countDocuments({
                roomId: forum._id,
                'readBy.user': { $ne: req.user._id },
                sender: { $ne: req.user._id },
                deleted: false
            });

            // Get last message
            const lastMessage = await ChatMessage.findOne({ 
                roomId: forum._id,
                deleted: false 
            })
                .populate('sender', 'name')
                .sort('-createdAt')
                .lean();

            // Get participants (users who have sent messages)
            const participants = await ChatMessage.distinct('sender', {
                roomId: forum._id
            });

            // Get online users
            const onlineUsers = await User.find({
                _id: { $in: participants },
                isOnline: true
            }).select('name');

            return {
                ...forum,
                unreadCount,
                lastMessage,
                participantCount: participants.length,
                onlineCount: onlineUsers.length,
                onlineUsers: onlineUsers.map(u => ({
                    _id: u._id,
                    name: u.name
                }))
            };
        })
    );

    res.json(roomsWithInfo);
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

/**
 * @desc    Mark messages as read
 * @route   POST /api/chat/rooms/:roomId/read
 * @access  Private
 */
export const markMessagesAsRead = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const { messageIds } = req.body;

    const query = {
        roomId,
        'readBy.user': { $ne: req.user._id }
    };

    if (messageIds && messageIds.length > 0) {
        query._id = { $in: messageIds };
    }

    const result = await ChatMessage.updateMany(
        query,
        {
            $push: {
                readBy: {
                    user: req.user._id,
                    readAt: new Date()
                }
            }
        }
    );

    res.json({
        success: true,
        markedAsRead: result.modifiedCount
    });
});

/**
 * @desc    Get room participants
 * @route   GET /api/chat/rooms/:roomId/participants
 * @access  Private
 */
export const getRoomParticipants = asyncHandler(async (req, res) => {
    const { roomId } = req.params;

    // Get all users who have sent messages in this room
    const senderIds = await ChatMessage.distinct('sender', { roomId });

    const participants = await User.find({
        _id: { $in: senderIds }
    })
    .select('name email professionalPath isOnline lastSeen')
    .lean();

    res.json(participants);
});

export default {
    getRoomMessages,
    sendMessage,
    getChatRooms,
    searchMessages,
    markMessagesAsRead,
    getRoomParticipants
};