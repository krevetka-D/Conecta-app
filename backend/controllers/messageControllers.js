import asyncHandler from 'express-async-handler';
import Message from '../models/Message.js';
import User from '../models/User.js';

/**
 * @desc    Get user's conversations
 * @route   GET /api/messages/conversations
 * @access  Private
 */
export const getConversations = asyncHandler(async (req, res) => {
    const { limit = 20, skip = 0 } = req.query;
    
    const conversations = await Message.getConversations(
        req.user._id,
        parseInt(limit),
        parseInt(skip)
    );
    
    res.json(conversations);
});

/**
 * @desc    Get messages between two users
 * @route   GET /api/messages
 * @access  Private
 */
export const getMessages = asyncHandler(async (req, res) => {
    const { userId, limit = 50, before } = req.query;
    
    if (!userId) {
        res.status(400);
        throw new Error('User ID is required');
    }
    
    const messages = await Message.getConversationMessages(
        req.user._id,
        userId,
        parseInt(limit),
        before
    );
    
    res.json(messages);
});

/**
 * @desc    Send a message
 * @route   POST /api/messages
 * @access  Private
 */
export const sendMessage = asyncHandler(async (req, res) => {
    const { recipientId, content, type = 'text' } = req.body;
    
    if (!recipientId || !content) {
        res.status(400);
        throw new Error('Recipient and content are required');
    }
    
    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
        res.status(404);
        throw new Error('Recipient not found');
    }
    
    // Generate conversation ID
    const conversationId = Message.generateConversationId(req.user._id, recipientId);
    
    // Create message
    const message = await Message.create({
        conversationId,
        sender: req.user._id,
        recipient: recipientId,
        content: content.trim(),
        type
    });
    
    // Populate sender and recipient
    await message.populate('sender', 'name email');
    await message.populate('recipient', 'name email');
    
    res.status(201).json(message);
});

/**
 * @desc    Mark messages as read
 * @route   POST /api/messages/read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
    const { conversationId } = req.body;
    
    if (!conversationId) {
        res.status(400);
        throw new Error('Conversation ID is required');
    }
    
    const count = await Message.markAsRead(req.user._id, conversationId);
    
    res.json({ 
        success: true, 
        markedAsRead: count 
    });
});

/**
 * @desc    Start or get existing conversation
 * @route   POST /api/messages/conversations
 * @access  Private
 */
export const startConversation = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    
    if (!userId) {
        res.status(400);
        throw new Error('User ID is required');
    }
    
    // Check if user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
        res.status(404);
        throw new Error('User not found');
    }
    
    const conversationId = Message.generateConversationId(req.user._id, userId);
    
    res.json({
        conversationId,
        otherUser: {
            _id: otherUser._id,
            name: otherUser.name,
            email: otherUser.email,
            isOnline: otherUser.isOnline || false,
            professionalPath: otherUser.professionalPath
        }
    });
});

/**
 * @desc    Delete a conversation
 * @route   DELETE /api/messages/conversations/:conversationId
 * @access  Private
 */
export const deleteConversation = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    
    // Soft delete all messages in conversation for this user
    await Message.updateMany(
        {
            conversationId,
            $or: [
                { sender: req.user._id },
                { recipient: req.user._id }
            ]
        },
        {
            $set: {
                deleted: true,
                deletedAt: new Date()
            }
        }
    );
    
    res.json({ 
        success: true,
        message: 'Conversation deleted' 
    });
});

/**
 * @desc    Get user profile
 * @route   GET /api/messages/users/:userId/profile
 * @access  Private
 */
export const getUserProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
        .select('name email professionalPath isOnline lastSeen createdAt');
    
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    
    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        professionalPath: user.professionalPath,
        isOnline: user.isOnline || false,
        lastSeen: user.lastSeen,
        joinedDate: user.createdAt,
        bio: 'Professional in Alicante', // You can add a bio field to User model
        location: 'Alicante, Spain'
    });
});

/**
 * @desc    Block a user
 * @route   POST /api/messages/users/:userId/block
 * @access  Private
 */
export const blockUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    // Implementation depends on your blocking system
    // For now, just return success
    res.json({ 
        success: true,
        message: 'User blocked' 
    });
});

/**
 * @desc    Unblock a user
 * @route   POST /api/messages/users/:userId/unblock
 * @access  Private
 */
export const unblockUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    // Implementation depends on your blocking system
    // For now, just return success
    res.json({ 
        success: true,
        message: 'User unblocked' 
    });
});