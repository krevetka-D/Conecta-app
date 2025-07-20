// backend/scripts/migrateForumsToChat.js
import mongoose from 'mongoose';
import Forum from '../models/Forum.js';
import Thread from '../models/Thread.js';
import Post from '../models/Post.js';
import ChatMessage from '../models/ChatMessage.js';

const migrateForumsToChat = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        
        // Get all threads and posts
        const threads = await Thread.find().populate('forum');
        
        for (const thread of threads) {
            // Get all posts in thread
            const posts = await Post.find({ thread: thread._id })
                .populate('author')
                .sort('createdAt');
            
            // Convert posts to chat messages
            for (const post of posts) {
                await ChatMessage.create({
                    roomId: thread.forum._id,
                    sender: post.author._id,
                    content: `[${thread.title}]\n${post.content}`,
                    type: 'text',
                    createdAt: post.createdAt
                });
            }
        }
        
        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
    }
};

// Run migration
migrateForumsToChat();