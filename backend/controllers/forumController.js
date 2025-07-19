// backend/controllers/forumController.js
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Forum from '../models/Forum.js';
import Thread from '../models/Thread.js';
import Post from '../models/Post.js';
import { cacheMiddleware, clearCache } from '../middleware/cacheMiddleware.js';

const getForums = asyncHandler(async (req, res) => {
    try {
        const forums = await Forum.find({ isActive: true })
            .select('title description user threads createdAt tags')
            .populate({
                path: 'user',
                select: 'name email professionalPath',
                options: { lean: true }
            })
            .sort('-createdAt')
            .lean(); // Remove the .cache('long') call - it doesn't exist
        
        res.json(forums);
    } catch (error) {
        console.error('Error fetching forums:', error);
        res.status(500).json({ 
            message: 'Failed to fetch forums',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

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
            throw new Error('A forum with this title already exists');
        }

        // Create forum with sanitized data
        const forum = await Forum.create({
            title: sanitizedTitle,
            description: sanitizedDescription,
            user: req.user._id,
            threads: [],
            tags: tags || []
        });

        // Populate user info before sending response
        const populatedForum = await Forum.findById(forum._id)
            .populate('user', 'name email professionalPath');

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
            throw new Error('A forum with this title already exists');
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

const getForum = asyncHandler(async (req, res) => {
    try {
        const forum = await Forum.findById(req.params.id)
            .populate({
                path: 'threads',
                populate: { 
                    path: 'author', 
                    select: 'name email professionalPath' 
                },
                options: { 
                    sort: { createdAt: -1 },
                    limit: 50 // Limit threads for performance
                }
            })
            .populate('user', 'name email professionalPath')
            .lean();

        if (!forum) {
            res.status(404);
            throw new Error('Forum not found');
        }

        res.json(forum);
    } catch (error) {
        if (error.name === 'CastError') {
            res.status(404);
            throw new Error('Forum not found');
        }
        throw error;
    }
});

const createThread = asyncHandler(async (req, res) => {
    const { title, content } = req.body;
    const forumId = req.params.id;

    // Validation
    if (!title || !content) {
        res.status(400);
        throw new Error('Title and content are required');
    }

    if (!req.user || !req.user._id) {
        res.status(401);
        throw new Error('User not authenticated');
    }

    try {
        const forum = await Forum.findById(forumId);
        if (!forum) {
            res.status(404);
            throw new Error('Forum not found');
        }

        // Create thread
        const thread = await Thread.create({
            title: title.trim(),
            forum: forum._id,
            author: req.user._id
        });

        // Create initial post
        await Post.create({
            content: content.trim(),
            thread: thread._id,
            author: req.user._id
        });

        // Add thread to forum - use $push for better performance
        await Forum.findByIdAndUpdate(
            forum._id,
            { $push: { threads: thread._id } },
            { new: true }
        );

        // Populate and return thread
        const populatedThread = await Thread.findById(thread._id)
            .populate('author', 'name email professionalPath')
            .lean();

        // Clear forum cache
        clearCache(`forum_${forumId}`);

        res.status(201).json(populatedThread);
    } catch (error) {
        throw error;
    }
});

const createPost = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const threadId = req.params.threadId;

    // Validation
    if (!content) {
        res.status(400);
        throw new Error('Content is required');
    }

    if (!req.user || !req.user._id) {
        res.status(401);
        throw new Error('User not authenticated');
    }

    try {
        const thread = await Thread.findById(threadId);
        if (!thread) {
            res.status(404);
            throw new Error('Thread not found');
        }

        const post = await Post.create({
            content: content.trim(),
            thread: thread._id,
            author: req.user._id
        });

        const populatedPost = await Post.findById(post._id)
            .populate('author', 'name email professionalPath')
            .lean();

        // Clear thread cache
        clearCache(`thread_${threadId}`);

        res.status(201).json(populatedPost);
    } catch (error) {
        if (error.name === 'CastError') {
            res.status(404);
            throw new Error('Thread not found');
        }
        throw error;
    }
});

const deleteForum = asyncHandler(async (req, res) => {
    try {
        const forum = await Forum.findById(req.params.id);

        if (!forum) {
            res.status(404);
            throw new Error('Forum not found');
        }

        // Check if user is the creator
        if (forum.user.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Only the forum creator can delete this forum');
        }

        // Use bulk operations for better performance
        const threads = await Thread.find({ forum: req.params.id }).select('_id');
        const threadIds = threads.map(t => t._id);

        if (threadIds.length > 0) {
            // Delete all posts in threads of this forum
            await Post.deleteMany({ thread: { $in: threadIds } });
            
            // Delete all threads in this forum
            await Thread.deleteMany({ _id: { $in: threadIds } });
        }

        // Delete the forum
        await Forum.findByIdAndDelete(req.params.id);

        // Clear all forum-related caches
        clearCache('forums');
        clearCache(`forum_${req.params.id}`);

        res.status(200).json({ 
            message: 'Forum and all associated content deleted successfully',
            id: req.params.id 
        });
    } catch (error) {
        if (error.name === 'CastError') {
            res.status(404);
            throw new Error('Forum not found');
        }
        throw error;
    }
});

const deleteThread = asyncHandler(async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.threadId);

        if (!thread) {
            res.status(404);
            throw new Error('Thread not found');
        }

        // Check if user is the author
        if (thread.author.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Only the thread author can delete this thread');
        }

        // Delete all posts in this thread
        await Post.deleteMany({ thread: req.params.threadId });

        // Remove thread from forum's threads array
        await Forum.findByIdAndUpdate(
            thread.forum,
            { $pull: { threads: req.params.threadId } }
        );

        // Delete the thread
        await Thread.findByIdAndDelete(req.params.threadId);

        // Clear caches
        clearCache(`forum_${thread.forum}`);
        clearCache(`thread_${req.params.threadId}`);

        res.status(200).json({ 
            message: 'Thread deleted successfully',
            id: req.params.threadId 
        });
    } catch (error) {
        if (error.name === 'CastError') {
            res.status(404);
            throw new Error('Thread not found');
        }
        throw error;
    }
});

// Add method to get threads with pagination
const getThreads = asyncHandler(async (req, res) => {
    const { forumId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    try {
        const forum = await Forum.findById(forumId);
        if (!forum) {
            res.status(404);
            throw new Error('Forum not found');
        }

        const threads = await Thread.find({ forum: forumId })
            .populate('author', 'name email professionalPath')
            .sort('-createdAt')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const count = await Thread.countDocuments({ forum: forumId });

        res.json({
            threads,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalThreads: count
        });
    } catch (error) {
        throw error;
    }
});

export { 
    getForums, 
    createForum, 
    getForum, 
    createThread, 
    createPost,
    deleteForum,
    deleteThread,
    getThreads 
};