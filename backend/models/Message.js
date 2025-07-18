// backend/models/Message.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    // Sender information
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Recipient information
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Message content
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    
    // Message type for different content types
    messageType: {
        type: String,
        enum: ['text', 'image', 'file', 'location', 'event_share', 'forum_share'],
        default: 'text'
    },
    
    // Attachments for images/files
    attachments: [{
        url: String,
        type: String,
        name: String,
        size: Number,
        thumbnailUrl: String
    }],
    
    // For shared content (events, forums, etc.)
    sharedContent: {
        contentType: {
            type: String,
            enum: ['event', 'forum', 'post']
        },
        contentId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'sharedContent.contentType'
        },
        preview: {
            title: String,
            description: String,
            imageUrl: String
        }
    },
    
    // Read status
    read: {
        type: Boolean,
        default: false,
        index: true
    },
    
    // Read timestamp
    readAt: {
        type: Date,
        default: null
    },
    
    // Delivery status
    deliveryStatus: {
        type: String,
        enum: ['sending', 'sent', 'delivered', 'failed'],
        default: 'sending'
    },
    
    // Delivered timestamp
    deliveredAt: {
        type: Date,
        default: null
    },
    
    // Edit history
    edited: {
        type: Boolean,
        default: false
    },
    
    editedAt: {
        type: Date,
        default: null
    },
    
    // Original message for edits
    originalContent: {
        type: String,
        default: null
    },
    
    // Reply to another message
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
    
    // Reactions/emojis
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
    
    // Conversation thread ID for grouping messages
    conversationId: {
        type: String,
        required: true,
        index: true
    },
    
    // For group messages (future feature)
    isGroupMessage: {
        type: Boolean,
        default: false
    },
    
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        default: null
    },
    
    // Soft delete
    deleted: {
        type: Boolean,
        default: false
    },
    
    deletedAt: {
        type: Date,
        default: null
    },
    
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    
    // Delete for everyone or just sender
    deletedForEveryone: {
        type: Boolean,
        default: false
    },
    
    // Encryption status
    encrypted: {
        type: Boolean,
        default: false
    },
    
    // For temporary/disappearing messages
    expiresAt: {
        type: Date,
        default: null
    },
    
    // System messages (user joined, left, etc.)
    isSystemMessage: {
        type: Boolean,
        default: false
    },
    
    systemMessageType: {
        type: String,
        enum: ['user_joined', 'user_left', 'chat_created', 'settings_changed'],
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, read: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ deleted: 1, deletedAt: 1 });

// Virtual for checking if message is expired
messageSchema.virtual('isExpired').get(function() {
    return this.expiresAt && this.expiresAt < new Date();
});

// Generate conversation ID for two users
messageSchema.statics.generateConversationId = function(userId1, userId2) {
    // Sort user IDs to ensure consistent conversation ID regardless of sender/recipient order
    const sortedIds = [userId1.toString(), userId2.toString()].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
};

// Get unread count for a user
messageSchema.statics.getUnreadCount = async function(userId) {
    return await this.countDocuments({
        recipient: userId,
        read: false,
        deleted: false
    });
};

// Get conversations list for a user
messageSchema.statics.getConversations = async function(userId, limit = 20, skip = 0) {
    const conversations = await this.aggregate([
        {
            $match: {
                $or: [
                    { sender: mongoose.Types.ObjectId(userId) },
                    { recipient: mongoose.Types.ObjectId(userId) }
                ],
                deleted: false
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $group: {
                _id: '$conversationId',
                lastMessage: { $first: '$$ROOT' },
                unreadCount: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ['$recipient', mongoose.Types.ObjectId(userId)] },
                                    { $eq: ['$read', false] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                }
            }
        },
        {
            $lookup: {
                from: 'users',
                let: { 
                    senderId: '$lastMessage.sender',
                    recipientId: '$lastMessage.recipient'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $ne: ['$_id', mongoose.Types.ObjectId(userId)] },
                                    {
                                        $or: [
                                            { $eq: ['$_id', '$$senderId'] },
                                            { $eq: ['$_id', '$$recipientId'] }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ],
                as: 'otherUser'
            }
        },
        {
            $unwind: '$otherUser'
        },
        {
            $sort: { 'lastMessage.createdAt': -1 }
        },
        {
            $skip: skip
        },
        {
            $limit: limit
        },
        {
            $project: {
                conversationId: '$_id',
                lastMessage: 1,
                unreadCount: 1,
                otherUser: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    avatar: 1,
                    isOnline: 1,
                    lastSeen: 1
                }
            }
        }
    ]);
    
    return conversations;
};

// Get messages for a conversation
messageSchema.statics.getConversationMessages = async function(conversationId, limit = 50, before = null) {
    const query = {
        conversationId,
        deleted: false
    };
    
    if (before) {
        query.createdAt = { $lt: before };
    }
    
    return await this.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('sender', 'name email avatar')
        .populate('recipient', 'name email avatar')
        .populate('replyTo', 'content sender');
};

// Mark messages as read
messageSchema.statics.markAsRead = async function(userId, conversationId) {
    const result = await this.updateMany(
        {
            conversationId,
            recipient: userId,
            read: false
        },
        {
            $set: {
                read: true,
                readAt: new Date()
            }
        }
    );
    
    return result.modifiedCount;
};

// Soft delete a message
messageSchema.methods.softDelete = async function(userId, deleteForEveryone = false) {
    this.deleted = true;
    this.deletedAt = new Date();
    this.deletedBy = userId;
    this.deletedForEveryone = deleteForEveryone;
    
    return await this.save();
};

// Clean up expired messages (run periodically)
messageSchema.statics.cleanupExpiredMessages = async function() {
    const now = new Date();
    return await this.deleteMany({
        expiresAt: { $lt: now }
    });
};

// Middleware to handle message updates
messageSchema.pre('save', function(next) {
    // If content is being edited, save original content
    if (this.isModified('content') && !this.isNew && !this.originalContent) {
        this.originalContent = this._original?.content || this.content;
        this.edited = true;
        this.editedAt = new Date();
    }
    
    // Generate conversation ID if not present
    if (!this.conversationId && this.sender && this.recipient && !this.isGroupMessage) {
        this.conversationId = this.constructor.generateConversationId(this.sender, this.recipient);
    }
    
    next();
});

// Create model
const Message = mongoose.model('Message', messageSchema);

module.exports = Message;