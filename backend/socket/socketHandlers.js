import ChatMessage from '../models/ChatMessage.js';
import Forum from '../models/Forum.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

export const setupSocketHandlers = (io) => {
    // Track online users and their rooms
    const onlineUsers = new Map(); // userId -> Set of socketIds
    const userRooms = new Map(); // userId -> Set of roomIds
    const roomTypingUsers = new Map(); // roomId -> Set of userIds

    io.on('connection', (socket) => {
        logger.info(`New client connected: ${socket.id}`);

        // Handle user authentication
        socket.on('authenticate', async (data) => {
            try {
                const { userId } = data;
                if (!userId) {
                    return socket.emit('error', { message: 'User ID required for authentication' });
                }

                socket.userId = userId;

                // Track user's socket connections
                if (!onlineUsers.has(userId)) {
                    onlineUsers.set(userId, new Set());
                }
                onlineUsers.get(userId).add(socket.id);

                // Initialize user rooms set
                if (!userRooms.has(userId)) {
                    userRooms.set(userId, new Set());
                }

                // Update user online status (only if first connection)
                if (onlineUsers.get(userId).size === 1) {
                    await User.findByIdAndUpdate(userId, { 
                        isOnline: true,
                        lastSeen: new Date()
                    });

                    // Notify others that user is online
                    socket.broadcast.emit('userOnline', { userId });
                }

                socket.emit('authenticated', { success: true });
            } catch (error) {
                logger.error('Authentication error:', error);
                socket.emit('error', { message: 'Authentication failed' });
            }
        });

        // Join a chat room (forum)
        socket.on('joinRoom', async (roomId) => {
            try {
                if (!socket.userId) {
                    return socket.emit('error', { message: 'Not authenticated' });
                }

                // Verify room exists
                const room = await Forum.findById(roomId);
                if (!room) {
                    return socket.emit('error', { message: 'Room not found' });
                }

                socket.join(roomId);
                userRooms.get(socket.userId).add(roomId);

                // Get recent messages with optimized query
                const messages = await ChatMessage.find({ 
                    roomId,
                    deleted: false 
                })
                    .populate('sender', 'name email')
                    .populate({
                        path: 'replyTo',
                        select: 'content sender',
                        populate: { path: 'sender', select: 'name' }
                    })
                    .sort({ createdAt: -1 })
                    .limit(50)
                    .lean()
                    .exec();

                // Send messages to the user
                socket.emit('roomMessages', messages.reverse());

                // Get online users in room
                const roomUsers = await getUsersInRoom(io, roomId);
                io.to(roomId).emit('roomUsers', roomUsers);

                // Notify others in room
                socket.to(roomId).emit('userJoinedRoom', {
                    userId: socket.userId,
                    roomId
                });

                logger.info(`User ${socket.userId} joined room ${roomId}`);
            } catch (error) {
                logger.error('Error joining room:', error);
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        // Leave a room
        socket.on('leaveRoom', (roomId) => {
            if (socket.userId && userRooms.has(socket.userId)) {
                socket.leave(roomId);
                userRooms.get(socket.userId).delete(roomId);
                
                // Clear typing status
                if (roomTypingUsers.has(roomId)) {
                    roomTypingUsers.get(roomId).delete(socket.userId);
                }

                socket.to(roomId).emit('userLeftRoom', {
                    userId: socket.userId,
                    roomId
                });
            }
        });

        // Handle sending messages with optimizations
        socket.on('sendMessage', async (data) => {
            try {
                if (!socket.userId) {
                    return socket.emit('error', { message: 'Not authenticated' });
                }

                const { roomId, content, type = 'text', attachments, replyTo } = data;

                // Validate input
                if (!roomId || !content?.trim()) {
                    return socket.emit('error', { message: 'Invalid message data' });
                }

                // Create message with lean document
                const message = await ChatMessage.create({
                    roomId,
                    sender: socket.userId,
                    content: content.trim(),
                    type,
                    attachments,
                    replyTo,
                    readBy: [{ user: socket.userId, readAt: new Date() }]
                });

                // Populate for response
                const populatedMessage = await ChatMessage.findById(message._id)
                    .populate('sender', 'name email')
                    .populate({
                        path: 'replyTo',
                        select: 'content sender',
                        populate: { path: 'sender', select: 'name' }
                    })
                    .lean()
                    .exec();

                // Send to all users in room
                io.to(roomId).emit('newMessage', populatedMessage);

                // Update forum last activity (async, don't await)
                Forum.findByIdAndUpdate(roomId, {
                    lastActivity: new Date()
                }).exec();

                // Clear typing status for sender
                handleTypingStop(socket, roomId);

            } catch (error) {
                logger.error('Error sending message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Handle typing indicators with debouncing
        socket.on('typing', ({ roomId, isTyping }) => {
            if (!socket.userId || !roomId) return;

            if (isTyping) {
                handleTypingStart(socket, roomId);
            } else {
                handleTypingStop(socket, roomId);
            }
        });

        // Handle message reactions
        socket.on('addReaction', async ({ messageId, emoji }) => {
            try {
                if (!socket.userId) {
                    return socket.emit('error', { message: 'Not authenticated' });
                }

                const message = await ChatMessage.findById(messageId);
                if (!message) {
                    return socket.emit('error', { message: 'Message not found' });
                }

                // Remove existing reaction from this user
                message.reactions = message.reactions.filter(
                    r => r.user.toString() !== socket.userId
                );

                // Add new reaction if emoji provided
                if (emoji) {
                    message.reactions.push({
                        user: socket.userId,
                        emoji
                    });
                }

                await message.save();

                // Notify room members
                io.to(message.roomId.toString()).emit('messageReaction', {
                    messageId,
                    reactions: message.reactions
                });
            } catch (error) {
                logger.error('Error adding reaction:', error);
                socket.emit('error', { message: 'Failed to add reaction' });
            }
        });

        // Handle message deletion
        socket.on('deleteMessage', async ({ messageId }) => {
            try {
                if (!socket.userId) {
                    return socket.emit('error', { message: 'Not authenticated' });
                }

                const message = await ChatMessage.findById(messageId);
                if (!message) {
                    return socket.emit('error', { message: 'Message not found' });
                }

                if (message.sender.toString() !== socket.userId) {
                    return socket.emit('error', { message: 'Unauthorized to delete this message' });
                }

                message.deleted = true;
                await message.save();

                // Notify room members
                io.to(message.roomId.toString()).emit('messageDeleted', { messageId });
            } catch (error) {
                logger.error('Error deleting message:', error);
                socket.emit('error', { message: 'Failed to delete message' });
            }
        });

        // Mark messages as read
        socket.on('markAsRead', async ({ roomId, messageIds }) => {
            try {
                if (!socket.userId) return;

                await ChatMessage.updateMany(
                    {
                        _id: { $in: messageIds },
                        roomId,
                        'readBy.user': { $ne: socket.userId }
                    },
                    {
                        $push: {
                            readBy: {
                                user: socket.userId,
                                readAt: new Date()
                            }
                        }
                    }
                );

                // Notify sender about read receipts
                socket.to(roomId).emit('messagesRead', {
                    userId: socket.userId,
                    messageIds
                });
            } catch (error) {
                logger.error('Error marking messages as read:', error);
            }
        });

        // Handle disconnect
        socket.on('disconnect', async () => {
            logger.info(`Client disconnected: ${socket.id}`);
            
            if (socket.userId) {
                // Remove this socket from user's connections
                const userSockets = onlineUsers.get(socket.userId);
                if (userSockets) {
                    userSockets.delete(socket.id);

                    // If user has no more connections, mark as offline
                    if (userSockets.size === 0) {
                        onlineUsers.delete(socket.userId);
                        
                        // Clear user from all typing statuses
                        for (const [roomId, typingUsers] of roomTypingUsers) {
                            if (typingUsers.has(socket.userId)) {
                                typingUsers.delete(socket.userId);
                                socket.to(roomId).emit('userTyping', {
                                    userId: socket.userId,
                                    isTyping: false
                                });
                            }
                        }

                        // Clear user rooms
                        userRooms.delete(socket.userId);

                        // Update user offline status
                        await User.findByIdAndUpdate(socket.userId, {
                            isOnline: false,
                            lastSeen: new Date()
                        });

                        // Notify others
                        socket.broadcast.emit('userOffline', { userId: socket.userId });
                    }
                }
            }
        });
    });

    // Helper functions
    function handleTypingStart(socket, roomId) {
        if (!roomTypingUsers.has(roomId)) {
            roomTypingUsers.set(roomId, new Set());
        }
        
        const wasTyping = roomTypingUsers.get(roomId).has(socket.userId);
        roomTypingUsers.get(roomId).add(socket.userId);
        
        if (!wasTyping) {
            socket.to(roomId).emit('userTyping', {
                userId: socket.userId,
                isTyping: true
            });
        }
    }

    function handleTypingStop(socket, roomId) {
        if (roomTypingUsers.has(roomId)) {
            const wasTyping = roomTypingUsers.get(roomId).has(socket.userId);
            roomTypingUsers.get(roomId).delete(socket.userId);
            
            if (wasTyping) {
                socket.to(roomId).emit('userTyping', {
                    userId: socket.userId,
                    isTyping: false
                });
            }
        }
    }

    async function getUsersInRoom(io, roomId) {
        const room = io.sockets.adapter.rooms.get(roomId);
        if (!room) return [];

        const userIds = new Set();
        for (const socketId of room) {
            const socket = io.sockets.sockets.get(socketId);
            if (socket?.userId) {
                userIds.add(socket.userId);
            }
        }

        return User.find({ _id: { $in: Array.from(userIds) } })
            .select('name email isOnline lastSeen')
            .lean()
            .exec();
    }

    // Periodic cleanup of typing users (every 5 seconds)
    setInterval(() => {
        for (const [roomId, typingUsers] of roomTypingUsers) {
            if (typingUsers.size === 0) {
                roomTypingUsers.delete(roomId);
            }
        }
    }, 5000);
};