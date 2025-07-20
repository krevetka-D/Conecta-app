import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Forum',
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 1000
    },
    type: {
        type: String,
        enum: ['text', 'image', 'file', 'system'],
        default: 'text'
    },
    attachments: [{
        url: String,
        type: String,
        name: String,
        size: Number
    }],
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatMessage'
    },
    edited: {
        type: Boolean,
        default: false
    },
    editedAt: Date,
    deleted: {
        type: Boolean,
        default: false
    },
    reactions: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        emoji: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Index for efficient queries
chatMessageSchema.index({ roomId: 1, createdAt: -1 });
chatMessageSchema.index({ sender: 1, createdAt: -1 });

// Virtual for checking if message is read by a specific user
chatMessageSchema.methods.isReadByUser = function(userId) {
    return this.readBy.some(read => read.user.toString() === userId.toString());
};

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessage;