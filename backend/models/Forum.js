// backend/models/Forum.js
import mongoose from 'mongoose';

const forumSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Forum title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [100, 'Title cannot exceed 100 characters'],
        unique: true 
    },
    description: { 
        type: String, 
        required: [true, 'Forum description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters'],
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: 'User',
        index: true 
    },
    threads: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Thread' 
    }],
    tags: [{
        type: String,
        lowercase: true,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add indexes for better performance
forumSchema.index({ title: 'text', description: 'text' });
forumSchema.index({ createdAt: -1 });
forumSchema.index({ user: 1, createdAt: -1 });

// Virtual for thread count
forumSchema.virtual('threadCount').get(function() {
    return this.threads ? this.threads.length : 0;
});

const Forum = mongoose.model('Forum', forumSchema);
export default Forum;