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

export { getForums, createForum, getForum, createThread, createPost };