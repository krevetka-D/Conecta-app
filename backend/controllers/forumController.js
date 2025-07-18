import asyncHandler from 'express-async-handler';
import Forum from '../models/Forum.js';
import Thread from '../models/Thread.js';
import Post from '../models/Post.js';

const getForums = asyncHandler(async (req, res) => {
    const forums = await Forum.find({}).populate('user', 'name');
    res.json(forums);
});

const createForum = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const forumExists = await Forum.findOne({ title });
    if (forumExists) {
        res.status(400);
        throw new Error('A forum with this title already exists');
    }
    const forum = await Forum.create({ title, description, user: req.user._id });
    res.status(201).json(forum);
});

const getForum = asyncHandler(async (req, res) => {
    const forum = await Forum.findById(req.params.id).populate({
        path: 'threads',
        populate: { path: 'author', select: 'name' },
    });
    if (forum) {
        res.json(forum);
    } else {
        res.status(404);
        throw new Error('Forum not found');
    }
});

const createThread = asyncHandler(async (req, res) => {
    const { title, content } = req.body;
    const forum = await Forum.findById(req.params.id);
    if (forum) {
        const thread = await Thread.create({ title, forum: forum._id, author: req.user._id });
        await Post.create({ content, thread: thread._id, author: req.user._id });
        forum.threads.push(thread._id);
        await forum.save();
        res.status(201).json(thread);
    } else {
        res.status(404);
        throw new Error('Forum not found');
    }
});

const createPost = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const thread = await Thread.findById(req.params.threadId);
    if (thread) {
        const post = await Post.create({ content, thread: thread._id, author: req.user._id });
        res.status(201).json(post);
    } else {
        res.status(404);
        throw new Error('Thread not found');
    }
});
export const deleteForum = asyncHandler(async (req, res) => {
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

    // Delete all posts in threads of this forum
    const threads = await Thread.find({ forum: req.params.id });
    for (const thread of threads) {
        await Post.deleteMany({ thread: thread._id });
    }

    // Delete all threads in this forum
    await Thread.deleteMany({ forum: req.params.id });

    // Delete the forum
    await Forum.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Forum and all associated content deleted successfully' });
});

export const deleteThread = asyncHandler(async (req, res) => {
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

    res.status(200).json({ message: 'Thread deleted successfully' });
});

export { getForums, createForum, getForum, createThread, createPost };