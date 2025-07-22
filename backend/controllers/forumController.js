//modifyed to switch from forums to chat-rooms

import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Forum from '../models/Forum.js';
import ChatMessage from '../models/ChatMessage.js';
import { cacheMiddleware, clearCache } from '../middleware/cacheMiddleware.js';

/**
 * @desc    Get all chat rooms (forums)
 * @route   GET /api/forums
 * @access  Public
 */
const getForums = asyncHandler(async (req, res) => {
    try {
        const forums = await Forum.find({ isActive: true })
            .select('title description user createdAt tags lastActivity')
            .populate({
                path: 'user',
                select: 'name email professionalPath',
                options: { lean: true }
            })
            .sort('-lastActivity')
            .lean();

        // Get additional info for each forum (last message, unread count, online users)
        const forumsWithInfo = await Promise.all(
            forums.map(async (forum) => {
                // Get last message
                const lastMessage = await ChatMessage.findOne({ 
                    roomId: forum._id,
                    deleted: false 
                })
                .populate('sender', 'name')
                .sort('-createdAt')
                .lean();

                // Get unread count for current user
                let unreadCount = 0;
                if (req.user) {
                    unreadCount = await ChatMessage.countDocuments({
                        roomId: forum._id,
                        'readBy.user': { $ne: req.user._id },
                        sender: { $ne: req.user._id }
                    });
                }

                // Get message count
                const messageCount = await ChatMessage.countDocuments({ 
                    roomId: forum._id 
                });

                return {
                    ...forum,
                    lastMessage,
                    unreadCount,
                    messageCount,
                    // Online count will be handled by Socket.IO
                    onlineCount: 0
                };
            })
        );
        
        res.json(forumsWithInfo);
    } catch (error) {
        console.error('Error fetching forums:', error);
        res.status(500).json({ 
            message: 'Failed to fetch chat rooms',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @desc    Create a new chat room (forum)
 * @route   POST /api/forums
 * @access  Private
 */
const createForum = asyncHandler(async (req, res) => {
    const { title, description, tags } = req.body;
    
    // Enhanced validation
    if (!title || !description) {
        res.status(400);
        throw new Error('Title and description are required');
    }

    // Sanitize inputs
    const sanitizedTitle = title.trim();
    const sanitizedDescription = description.trim();

    // Additional validation
    if (sanitizedTitle.length < 3) {
        res.status(400);
        throw new Error('Title must be at least 3 characters long');
    }

    if (sanitizedDescription.length < 10) {
        res.status(400);
        throw new Error('Description must be at least 10 characters long');
    }

    if (!req.user || !req.user._id) {
        res.status(401);
        throw new Error('User not authenticated');
    }

    try {
        // Check if forum with same title exists (case-insensitive)
        const forumExists = await Forum.findOne({ 
            title: { $regex: new RegExp(`^${sanitizedTitle}$`, 'i') }
        });
        
        if (forumExists) {
            res.status(400);
            throw new Error('A chat room with this title already exists');
        }

        // Create forum with sanitized data
        const forum = await Forum.create({
            title: sanitizedTitle,
            description: sanitizedDescription,
            user: req.user._id,
            tags: tags || [],
            lastActivity: new Date()
        });

        // Populate user info before sending response
        const populatedForum = await Forum.findById(forum._id)
            .populate('user', 'name email professionalPath');

        // Create welcome message
        await ChatMessage.create({
            roomId: forum._id,
            sender: req.user._id,
            content: `Welcome to ${sanitizedTitle}! This chat room was created for: ${sanitizedDescription}`,
            type: 'system'
        });

        // Clear cache when new forum is created
        clearCache('forums');

        res.status(201).json({
            success: true,
            data: populatedForum
        });
    } catch (error) {
        // Handle duplicate key error
        if (error.code === 11000) {
            res.status(400);
            throw new Error('A chat room with this title already exists');
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            res.status(400);
            throw new Error(messages.join(', '));
        }
        
        throw error;
    }
});

/**
 * @desc    Get single chat room details
 * @route   GET /api/forums/:id
 * @access  Public
 */
const getForum = asyncHandler(async (req, res) => {
    try {
        const forum = await Forum.findById(req.params.id)
            .populate('user', 'name email professionalPath')
            .lean();

        if (!forum) {
            res.status(404);
            throw new Error('Chat room not found');
        }

        // Get participant count
        const participantCount = await ChatMessage.distinct('sender', { 
            roomId: req.params.id 
        }).countDocuments();

        // Get message count
        const messageCount = await ChatMessage.countDocuments({ 
            roomId: req.params.id 
        });

        // Get last 50 messages for preview
        const recentMessages = await ChatMessage.find({ 
            roomId: req.params.id,
            deleted: false
        })
        .populate('sender', 'name email')
        .sort('-createdAt')
        .limit(50)
        .lean();

        res.json({
            ...forum,
            participantCount,
            messageCount,
            recentMessages: recentMessages.reverse() // Chronological order
        });
    } catch (error) {
        if (error.name === 'CastError') {
            res.status(404);
            throw new Error('Chat room not found');
        }
        throw error;
    }
});

/**
 * @desc    Delete a chat room and all its messages
 * @route   DELETE /api/forums/:id
 * @access  Private (creator only)
 */
const deleteForum = asyncHandler(async (req, res) => {
    try {
        const forum = await Forum.findById(req.params.id);

        if (!forum) {
            res.status(404);
            throw new Error('Chat room not found');
        }

        // Check if user is the creator
        if (forum.user.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Only the chat room creator can delete this room');
        }

        // Delete all messages in this chat room
        await ChatMessage.deleteMany({ roomId: req.params.id });

        // Delete the forum
        await Forum.findByIdAndDelete(req.params.id);

        // Clear all forum-related caches
        clearCache('forums');
        clearCache(`forum_${req.params.id}`);

        res.status(200).json({ 
            message: 'Chat room and all messages deleted successfully',
            id: req.params.id 
        });
    } catch (error) {
        if (error.name === 'CastError') {
            res.status(404);
            throw new Error('Chat room not found');
        }
        throw error;
    }
});

/**
 * @desc    Search chat rooms
 * @route   GET /api/forums/search
 * @access  Public
 */
const searchForums = asyncHandler(async (req, res) => {
    const { q, tags } = req.query;

    if (!q && !tags) {
        return res.json([]);
    }

    const searchQuery = { isActive: true };

    if (q) {
        searchQuery.$or = [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } }
        ];
    }

    if (tags) {
        const tagArray = Array.isArray(tags) ? tags : tags.split(',');
        searchQuery.tags = { $in: tagArray };
    }

    const forums = await Forum.find(searchQuery)
        .populate('user', 'name')
        .select('title description tags lastActivity')
        .sort('-lastActivity')
        .limit(20)
        .lean();

    res.json(forums);
});

/**
 * @desc    Get user's chat rooms
 * @route   GET /api/forums/my-rooms
 * @access  Private
 */
const getMyForums = asyncHandler(async (req, res) => {
    // Get rooms created by user
    const createdRooms = await Forum.find({ 
        user: req.user._id,
        isActive: true 
    })
    .populate('user', 'name')
    .sort('-lastActivity')
    .lean();

    // Get rooms where user has sent messages (participated)
    const participatedRoomIds = await ChatMessage.distinct('roomId', {
        sender: req.user._id
    });

    const participatedRooms = await Forum.find({
        _id: { $in: participatedRoomIds },
        user: { $ne: req.user._id }, // Exclude rooms created by user
        isActive: true
    })
    .populate('user', 'name')
    .sort('-lastActivity')
    .lean();

    res.json({
        created: createdRooms,
        participated: participatedRooms
    });
});

/**
 * @desc    Update chat room details
 * @route   PUT /api/forums/:id
 * @access  Private (creator only)
 */
const updateForum = asyncHandler(async (req, res) => {
    const { title, description, tags } = req.body;

    const forum = await Forum.findById(req.params.id);

    if (!forum) {
        res.status(404);
        throw new Error('Chat room not found');
    }

    // Check if user is the creator
    if (forum.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Only the chat room creator can update this room');
    }

    // Update fields
    if (title) forum.title = title.trim();
    if (description) forum.description = description.trim();
    if (tags !== undefined) forum.tags = tags;

    const updatedForum = await forum.save();

    // Clear cache
    clearCache('forums');
    clearCache(`forum_${req.params.id}`);

    res.json(updatedForum);
});

export { 
    getForums, 
    createForum, 
    getForum, 
    deleteForum,
    searchForums,
    getMyForums,
    updateForum
};