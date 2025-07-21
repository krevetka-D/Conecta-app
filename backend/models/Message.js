// backend/models/Message.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    // Conversation ID for grouping messages
    conversationId: {
        type: String,
        required: true,
        index: true
    },
    
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
    
    // Message type
    type: {
        type: String,
        enum: ['text', 'image', 'file', 'system'],
        default: 'text'
    },
    
    // Read status
    read: {
        type: Boolean,
        default: false,
        index: true
    },
    
    readAt: {
        type: Date,
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
    }
}, {
    timestamps: true
});

// Indexes for better query performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, read: 1 });

// Generate conversation ID for two users
messageSchema.statics.generateConversationId = function(userId1, userId2) {
    const sortedIds = [userId1.toString(), userId2.toString()].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
};

// Get conversations list for a user
messageSchema.statics.getConversations = async function(userId, limit = 20, skip = 0) {
    const conversations = await this.aggregate([
        {
            $match: {
                $or: [
                    { sender: new mongoose.Types.ObjectId(userId) },
                    { recipient: new mongoose.Types.ObjectId(userId) }
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
                                    { $eq: ['$recipient', new mongoose.Types.ObjectId(userId)] },
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
                                    { $ne: ['$_id', new mongoose.Types.ObjectId(userId)] },
                                    {
                                        $or: [
                                            { $eq: ['$_id', '$$senderId'] },
                                            { $eq: ['$_id', '$$recipientId'] }
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            name: 1,
                            email: 1,
                            isOnline: 1,
                            lastSeen: 1,
                            professionalPath: 1
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
                otherUser: 1
            }
        }
    ]);
    
    return conversations;
};

// Get messages for a conversation
messageSchema.statics.getConversationMessages = async function(userId1, userId2, limit = 50, before = null) {
    const conversationId = this.generateConversationId(userId1, userId2);
    
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
        .populate('sender', 'name email')
        .populate('recipient', 'name email');
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

const Message = mongoose.model('Message', messageSchema);

export default Message;