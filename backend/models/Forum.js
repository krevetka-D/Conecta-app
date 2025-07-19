
import mongoose from 'mongoose';

const forumSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Forum title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [100, 'Title cannot exceed 100 characters'],
        unique: true,
        index: true 
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
        trim: true,
        index: true
    }],
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    lastActivity: {
        type: Date,
        default: Date.now,
        index: true
    },
    subscriberCount: {
        type: Number,
        default: 0,
        index: true
    },
    viewCount: {
        type: Number,
        default: 0
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Text index for search
forumSchema.index({ title: 'text', description: 'text' });
// Compound indexes
forumSchema.index({ createdAt: -1, isActive: 1 });
forumSchema.index({ user: 1, createdAt: -1 });
forumSchema.index({ tags: 1, isActive: 1 });
forumSchema.index({ lastActivity: -1, isActive: 1 });

// Virtual for thread count
forumSchema.virtual('threadCount').get(function() {
    return this.threads ? this.threads.length : 0;
});

// Methods
forumSchema.methods.incrementViewCount = async function() {
    this.viewCount += 1;
    return this.save();
};

const Forum = mongoose.model('Forum', forumSchema);
export default Forum;