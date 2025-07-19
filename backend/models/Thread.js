
import mongoose from 'mongoose';

const ThreadSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 200,
        index: true
    },
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true 
    },
    forum: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Forum', 
        required: true,
        index: true 
    },
    viewCount: {
        type: Number,
        default: 0,
        index: true
    },
    replyCount: {
        type: Number,
        default: 0,
        index: true
    },
    lastReplyAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    lastReplyBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isPinned: {
        type: Boolean,
        default: false,
        index: true
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        lowercase: true,
        trim: true
    }]
}, { 
    timestamps: true 
});

// Compound indexes
ThreadSchema.index({ forum: 1, isPinned: -1, updatedAt: -1 });
ThreadSchema.index({ forum: 1, viewCount: -1 });
ThreadSchema.index({ author: 1, createdAt: -1 });
ThreadSchema.index({ title: 'text' });

const Thread = mongoose.model('Thread', ThreadSchema);
export default Thread;
