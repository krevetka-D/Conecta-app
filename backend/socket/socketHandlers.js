import ChatMessage from '../models/ChatMessage.js';
import Forum from '../models/Forum.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import logger from '../utils/logger.js';

export const setupSocketHandlers = (io) => {
    // Connection tracking
    const connections = new Map(); // socketId -> { userId, roomIds }
    const userSockets = new Map(); // userId -> Set of socketIds
    const roomUsers = new Map(); // roomId -> Set of userIds
    
    // Message delivery tracking
    const messageDeliveryStatus = new Map(); // messageId -> Set of delivered userIds
    
    // Heartbeat mechanism
    const HEARTBEAT_INTERVAL = 25000; // 25 seconds
    const HEARTBEAT_TIMEOUT = 60000; // 60 seconds
    const heartbeats = new Map(); // socketId -> lastHeartbeat
    
    // Start heartbeat checker
    const heartbeatChecker = setInterval(() => {
        const now = Date.now();
        for (const [socketId, lastBeat] of heartbeats) {
            if (now - lastBeat > HEARTBEAT_TIMEOUT) {
                const socket = io.sockets.sockets.get(socketId);
                if (socket) {
                    logger.info(`Disconnecting inactive socket: ${socketId}`);
                    socket.disconnect(true);
                }
                heartbeats.delete(socketId);
            }
        }
    }, HEARTBEAT_INTERVAL);

    // Cleanup on server shutdown
    process.on('SIGTERM', () => {
        clearInterval(heartbeatChecker);
    });

    io.on('connection', async (socket) => {
        logger.info(`Socket connected: ${socket.id}`);
        
        // Initialize heartbeat
        heartbeats.set(socket.id, Date.now());
        
        // Get user from socket middleware
        const userId = socket.userId;
        const user = socket.user;
        
        if (userId && userId !== 'anonymous') {
            try {
                // Update user online status
                await User.findByIdAndUpdate(userId, {
                    isOnline: true,
                    lastSeen: new Date(),
                    $addToSet: { socketIds: socket.id }
                });
                
                // Store connection info
                connections.set(socket.id, { userId, roomIds: new Set() });
                
                // Track user sockets
                if (!userSockets.has(userId)) {
                    userSockets.set(userId, new Set());
                }
                userSockets.get(userId).add(socket.id);
                
                // Join user's personal room for notifications
                socket.join(`user_${userId}`);
                
                // Send connection success with user info
                socket.emit('connected', {
                    socketId: socket.id,
                    userId,
                    timestamp: new Date().toISOString(),
                    authenticated: true,
                    user: {
                        _id: userId,
                        name: user?.name,
                        email: user?.email
                    }
                });
                
                // Notify others about user online
                socket.broadcast.emit('userOnline', { 
                    userId,
                    name: user?.name,
                    timestamp: new Date().toISOString()
                });
                
                // Send any pending messages
                await sendPendingMessages(socket, userId);
                
            } catch (error) {
                logger.error('Error setting up authenticated connection:', error);
                socket.emit('error', {
                    type: 'CONNECTION_ERROR',
                    message: 'Failed to setup connection',
                    code: 'SETUP_FAILED'
                });
            }
        } else {
            // Anonymous connection
            socket.emit('connected', {
                socketId: socket.id,
                timestamp: new Date().toISOString(),
                authenticated: false,
                message: 'Connected in anonymous mode'
            });
        }

        // Handle heartbeat
        socket.on('heartbeat', () => {
            heartbeats.set(socket.id, Date.now());
            socket.emit('heartbeat_ack', {
                timestamp: new Date().toISOString(),
                serverTime: Date.now()
            });
        });

        // Handle room join with enhanced response
        socket.on('joinRoom', async (roomId) => {
            try {
                const connection = connections.get(socket.id);
                
                if (!connection) {
                    return socket.emit('error', { 
                        type: 'JOIN_ROOM_ERROR',
                        message: 'Authentication required to join rooms',
                        code: 'NOT_AUTHENTICATED'
                    });
                }

                // Validate roomId
                if (!roomId || typeof roomId !== 'string') {
                    return socket.emit('error', {
                        type: 'JOIN_ROOM_ERROR',
                        message: 'Invalid room ID',
                        code: 'INVALID_ROOM_ID'
                    });
                }

                // Verify room exists
                const room = await Forum.findById(roomId);
                if (!room) {
                    return socket.emit('error', { 
                        type: 'JOIN_ROOM_ERROR',
                        message: 'Room not found',
                        code: 'ROOM_NOT_FOUND',
                        roomId
                    });
                }

                // Leave previous rooms (optional - depends on your app logic)
                for (const prevRoomId of connection.roomIds) {
                    socket.leave(prevRoomId);
                    const users = roomUsers.get(prevRoomId);
                    if (users) {
                        users.delete(connection.userId);
                        if (users.size === 0) {
                            roomUsers.delete(prevRoomId);
                        }
                    }
                }

                // Join the new room
                socket.join(roomId);
                connection.roomIds.clear();
                connection.roomIds.add(roomId);

                // Track room users
                if (!roomUsers.has(roomId)) {
                    roomUsers.set(roomId, new Set());
                }
                roomUsers.get(roomId).add(connection.userId);

                // Get online users in room
                const onlineUserIds = Array.from(roomUsers.get(roomId) || []);
                const onlineUsers = await User.find({ 
                    _id: { $in: onlineUserIds } 
                }).select('name email isOnline lastSeen');

                // Load recent messages with proper population
                const messages = await ChatMessage.find({ 
                    roomId,
                    deleted: false 
                })
                .populate('sender', 'name email isOnline')
                .populate({
                    path: 'replyTo',
                    select: 'content sender',
                    populate: { path: 'sender', select: 'name' }
                })
                .sort({ createdAt: -1 })
                .limit(50)
                .lean();

                // Ensure all messages have the roomId
                const messagesWithRoomId = messages.map(msg => ({
                    ...msg,
                    roomId: roomId
                }));

                // Mark messages as read
                const unreadMessages = await ChatMessage.updateMany(
                    {
                        roomId,
                        'readBy.user': { $ne: connection.userId },
                        sender: { $ne: connection.userId }
                    },
                    {
                        $push: {
                            readBy: {
                                user: connection.userId,
                                readAt: new Date()
                            }
                        }
                    }
                );

                // Update room's last activity
                await Forum.findByIdAndUpdate(roomId, {
                    lastActivity: new Date(),
                    $inc: { viewCount: 1 }
                });

                // Send comprehensive room data
                socket.emit('joinedRoom', {
                    roomId,
                    roomTitle: room.title,
                    roomDescription: room.description,
                    success: true,
                    messages: messagesWithRoomId.reverse(), // Chronological order
                    onlineUsers,
                    totalUsers: onlineUserIds.length,
                    unreadCount: unreadMessages.modifiedCount || 0,
                    timestamp: new Date().toISOString()
                });

                // Notify others in the room
                socket.to(roomId).emit('userJoinedRoom', {
                    userId: connection.userId,
                    userName: user?.name,
                    roomId,
                    timestamp: new Date().toISOString(),
                    onlineUsersCount: onlineUserIds.length
                });

                logger.info(`User ${connection.userId} joined room ${roomId}`);
                
            } catch (error) {
                logger.error('Error joining room:', error);
                socket.emit('error', { 
                    type: 'JOIN_ROOM_ERROR',
                    message: 'Failed to join room',
                    error: error.message,
                    roomId
                });
            }
        });

        // Handle leaving room
        socket.on('leaveRoom', async (roomId) => {
            try {
                const connection = connections.get(socket.id);
                
                if (!connection) return;

                socket.leave(roomId);
                connection.roomIds.delete(roomId);

                const users = roomUsers.get(roomId);
                if (users) {
                    users.delete(connection.userId);
                    if (users.size === 0) {
                        roomUsers.delete(roomId);
                    }
                }

                // Notify others in the room
                socket.to(roomId).emit('userLeftRoom', {
                    userId: connection.userId,
                    userName: user?.name,
                    roomId,
                    timestamp: new Date().toISOString(),
                    remainingUsers: users ? users.size : 0
                });

                socket.emit('leftRoom', { 
                    roomId, 
                    success: true,
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                logger.error('Error leaving room:', error);
                socket.emit('error', {
                    type: 'LEAVE_ROOM_ERROR',
                    message: 'Failed to leave room',
                    error: error.message
                });
            }
        });

        // Enhanced message sending with delivery tracking
        socket.on('sendMessage', async (data) => {
            try {
                const connection = connections.get(socket.id);
                
                if (!connection) {
                    return socket.emit('error', { 
                        type: 'MESSAGE_ERROR',
                        message: 'Authentication required to send messages',
                        code: 'NOT_AUTHENTICATED'
                    });
                }

                const { roomId, content, type = 'text', attachments, replyTo } = data;

                // Validate input
                if (!roomId || !content?.trim()) {
                    return socket.emit('error', { 
                        type: 'MESSAGE_ERROR',
                        message: 'Invalid message data',
                        code: 'INVALID_DATA'
                    });
                }

                // Verify user is in room
                if (!connection.roomIds.has(roomId)) {
                    return socket.emit('error', { 
                        type: 'MESSAGE_ERROR',
                        message: 'You must join the room first',
                        code: 'NOT_IN_ROOM'
                    });
                }

                // Create message with error handling
                let message;
                try {
                    message = await ChatMessage.create({
                        roomId,
                        sender: connection.userId,
                        content: content.trim(),
                        type,
                        attachments: attachments || [],
                        replyTo,
                        readBy: [{ user: connection.userId, readAt: new Date() }]
                    });
                } catch (dbError) {
                    logger.error('Database error creating message:', dbError);
                    return socket.emit('error', {
                        type: 'MESSAGE_ERROR',
                        message: 'Failed to save message',
                        code: 'DB_ERROR'
                    });
                }

                // Populate for response
                const populatedMessage = await ChatMessage.findById(message._id)
                    .populate('sender', 'name email isOnline')
                    .populate({
                        path: 'replyTo',
                        select: 'content sender',
                        populate: { path: 'sender', select: 'name' }
                    })
                    .lean();

                // Ensure roomId is included in the message
                const messageWithRoomId = {
                    ...populatedMessage,
                    roomId: roomId
                };

                // Initialize delivery tracking
                messageDeliveryStatus.set(message._id.toString(), new Set([connection.userId]));

                // Send to all users in room (including sender for consistency)
                io.to(roomId).emit('newMessage', messageWithRoomId);

                // Update forum activity
                await Forum.findByIdAndUpdate(roomId, {
                    lastActivity: new Date(),
                    $inc: { messageCount: 1 }
                });

                // Send acknowledgment to sender
                socket.emit('messageSent', {
                    messageId: message._id,
                    roomId: roomId,
                    timestamp: new Date().toISOString(),
                    success: true,
                    message: messageWithRoomId
                });

                // Track delivery for online users
                const roomUserIds = roomUsers.get(roomId);
                if (roomUserIds) {
                    roomUserIds.forEach(userId => {
                        if (userId !== connection.userId) {
                            // Check if user is online and emit delivery status
                            const userSocketIds = userSockets.get(userId);
                            if (userSocketIds && userSocketIds.size > 0) {
                                messageDeliveryStatus.get(message._id.toString()).add(userId);
                            }
                        }
                    });
                }

                logger.info(`Message sent in room ${roomId} by user ${connection.userId}`);

            } catch (error) {
                logger.error('Error sending message:', error);
                socket.emit('error', { 
                    type: 'MESSAGE_ERROR',
                    message: 'Failed to send message',
                    error: error.message,
                    code: 'SEND_FAILED'
                });
            }
        });

        // Handle typing indicators with room validation
        socket.on('typing', (data) => {
            const connection = connections.get(socket.id);
            if (!connection) return;

            const { roomId, isTyping } = data;
            
            // Validate user is in the room
            if (!connection.roomIds.has(roomId)) {
                return;
            }
            
            socket.to(roomId).emit('userTyping', {
                userId: connection.userId,
                userName: user?.name,
                isTyping,
                roomId,
                timestamp: new Date().toISOString()
            });
        });

        // Handle message read receipts
        socket.on('markAsRead', async (data) => {
            try {
                const connection = connections.get(socket.id);
                if (!connection) return;

                const { roomId, messageIds } = data;

                const result = await ChatMessage.updateMany(
                    {
                        _id: { $in: messageIds },
                        roomId,
                        'readBy.user': { $ne: connection.userId }
                    },
                    {
                        $push: {
                            readBy: {
                                user: connection.userId,
                                readAt: new Date()
                            }
                        }
                    }
                );

                // Notify sender about read receipt
                const messages = await ChatMessage.find({
                    _id: { $in: messageIds }
                }).select('sender');

                const senderIds = [...new Set(messages.map(m => m.sender.toString()))];
                senderIds.forEach(senderId => {
                    const senderSockets = userSockets.get(senderId);
                    if (senderSockets) {
                        senderSockets.forEach(socketId => {
                            io.to(socketId).emit('messagesRead', {
                                messageIds,
                                readBy: connection.userId,
                                roomId,
                                timestamp: new Date().toISOString()
                            });
                        });
                    }
                });

                socket.emit('markedAsRead', {
                    success: true,
                    count: result.modifiedCount
                });

            } catch (error) {
                logger.error('Error marking messages as read:', error);
            }
        });

        // Handle personal messages
        socket.on('private_message', async (data) => {
            try {
                const connection = connections.get(socket.id);
                if (!connection) {
                    return socket.emit('error', {
                        type: 'MESSAGE_ERROR',
                        message: 'Authentication required',
                        code: 'NOT_AUTHENTICATED'
                    });
                }

                const { recipientId, content, type = 'text' } = data;

                if (!recipientId || !content?.trim()) {
                    return socket.emit('error', {
                        type: 'MESSAGE_ERROR',
                        message: 'Invalid message data',
                        code: 'INVALID_DATA'
                    });
                }

                // Create personal message
                const conversationId = Message.generateConversationId(connection.userId, recipientId);
                
                const message = await Message.create({
                    conversationId,
                    sender: connection.userId,
                    recipient: recipientId,
                    content: content.trim(),
                    type
                });

                // Populate message
                await message.populate('sender', 'name email');
                await message.populate('recipient', 'name email');

                // Send to recipient if online
                const recipientSockets = userSockets.get(recipientId);
                if (recipientSockets) {
                    recipientSockets.forEach(socketId => {
                        io.to(socketId).emit('private_message', message);
                    });
                }

                // Send confirmation to sender
                socket.emit('private_message_sent', {
                    message,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                logger.error('Error sending private message:', error);
                socket.emit('error', {
                    type: 'MESSAGE_ERROR',
                    message: 'Failed to send private message',
                    error: error.message
                });
            }
        });

        // Handle user status updates
        socket.on('update_status', async (data) => {
            try {
                const connection = connections.get(socket.id);
                if (!connection) return;

                const { isOnline } = data;

                await User.findByIdAndUpdate(connection.userId, {
                    isOnline,
                    lastSeen: new Date()
                });

                // Broadcast status change
                socket.broadcast.emit('user_status_update', {
                    userId: connection.userId,
                    isOnline,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                logger.error('Error updating user status:', error);
            }
        });

        // Handle disconnection with cleanup
        socket.on('disconnect', async (reason) => {
            logger.info(`Socket disconnected: ${socket.id}, reason: ${reason}`);
            
            const connection = connections.get(socket.id);
            
            if (connection) {
                const { userId, roomIds } = connection;
                
                try {
                    // Update user status
                    const userDoc = await User.findById(userId);
                    if (userDoc) {
                        await userDoc.removeSocketId(socket.id);
                    }
                    
                    // Remove from user sockets
                    const sockets = userSockets.get(userId);
                    if (sockets) {
                        sockets.delete(socket.id);
                        
                        if (sockets.size === 0) {
                            userSockets.delete(userId);
                            
                            // User is now offline
                            socket.broadcast.emit('userOffline', { 
                                userId,
                                name: userDoc?.name,
                                timestamp: new Date().toISOString()
                            });
                        }
                    }
                    
                    // Remove from all rooms
                    for (const roomId of roomIds) {
                        const users = roomUsers.get(roomId);
                        if (users) {
                            users.delete(userId);
                            if (users.size === 0) {
                                roomUsers.delete(roomId);
                            } else {
                                // Notify room members
                                socket.to(roomId).emit('userLeftRoom', {
                                    userId,
                                    userName: userDoc?.name,
                                    roomId,
                                    reason: 'disconnect',
                                    timestamp: new Date().toISOString()
                                });
                            }
                        }
                    }
                } catch (error) {
                    logger.error('Error handling disconnect:', error);
                }
                
                connections.delete(socket.id);
            }
            
            heartbeats.delete(socket.id);
        });

        // Error handler
        socket.on('error', (error) => {
            logger.error(`Socket error for ${socket.id}:`, error);
            socket.emit('error', {
                type: 'SOCKET_ERROR',
                message: error.message || 'Unknown socket error',
                timestamp: new Date().toISOString()
            });
        });
    });

    // Helper function to send pending messages
    async function sendPendingMessages(socket, userId) {
        try {
            // Check for unread messages in user's rooms
            const userRooms = await Forum.find({
                $or: [
                    { user: userId },
                    { subscribers: userId }
                ]
            }).select('_id');

            const roomIds = userRooms.map(r => r._id);

            // Get recent unread messages
            const unreadMessages = await ChatMessage.find({
                roomId: { $in: roomIds },
                'readBy.user': { $ne: userId },
                sender: { $ne: userId }
            })
            .populate('sender', 'name email')
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

            if (unreadMessages.length > 0) {
                socket.emit('pendingMessages', {
                    messages: unreadMessages,
                    count: unreadMessages.length,
                    timestamp: new Date().toISOString()
                });
            }

        } catch (error) {
            logger.error('Error sending pending messages:', error);
        }
    }

    // Periodic cleanup of stale data
    setInterval(() => {
        const now = Date.now();
        
        // Clean up old heartbeats
        for (const [socketId, lastBeat] of heartbeats) {
            if (now - lastBeat > HEARTBEAT_TIMEOUT * 2) {
                heartbeats.delete(socketId);
            }
        }
        
        // Clean up old message delivery status
        if (messageDeliveryStatus.size > 1000) {
            // Keep only the 500 most recent
            const entries = Array.from(messageDeliveryStatus.entries());
            const toKeep = entries.slice(-500);
            messageDeliveryStatus.clear();
            toKeep.forEach(([k, v]) => messageDeliveryStatus.set(k, v));
        }
        
        // Log stats
        logger.info(`Socket stats - Connections: ${connections.size}, Users: ${userSockets.size}, Rooms with users: ${roomUsers.size}`);
    }, 60000); // Every minute
};