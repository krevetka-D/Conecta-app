import ChatMessage from '../models/ChatMessage.js';
import Forum from '../models/Forum.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

export const setupSocketHandlers = (io) => {
    // Connection tracking
    const connections = new Map(); // socketId -> { userId, roomIds }
    const userSockets = new Map(); // userId -> Set of socketIds
    const roomUsers = new Map(); // roomId -> Set of userIds
    
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
                
                // Join user's personal room
                socket.join(`user_${userId}`);
                
                // Send connection success
                socket.emit('connected', {
                    socketId: socket.id,
                    userId,
                    timestamp: new Date().toISOString(),
                    authenticated: true
                });
                
                // Notify others about user online
                socket.broadcast.emit('userOnline', { 
                    userId,
                    name: user?.name 
                });
                
            } catch (error) {
                logger.error('Error setting up authenticated connection:', error);
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
                timestamp: new Date().toISOString()
            });
        });

        // Handle room join
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

                // Verify room exists
                const room = await Forum.findById(roomId);
                if (!room) {
                    return socket.emit('error', { 
                        type: 'JOIN_ROOM_ERROR',
                        message: 'Room not found',
                        code: 'ROOM_NOT_FOUND'
                    });
                }

                // Leave previous rooms (optional - depends on your app logic)
                for (const prevRoomId of connection.roomIds) {
                    socket.leave(prevRoomId);
                    const users = roomUsers.get(prevRoomId);
                    if (users) {
                        users.delete(connection.userId);
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
                }).select('name email isOnline');

                // Load recent messages
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

                // Mark messages as read
                await ChatMessage.updateMany(
                    {
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

                // Send room data
                socket.emit('joinedRoom', {
                    roomId,
                    success: true,
                    messages: messages.reverse(),
                    onlineUsers,
                    totalUsers: onlineUserIds.length
                });

                // Notify others
                socket.to(roomId).emit('userJoinedRoom', {
                    userId: connection.userId,
                    userName: user?.name,
                    roomId,
                    timestamp: new Date().toISOString()
                });

                logger.info(`User ${connection.userId} joined room ${roomId}`);
            } catch (error) {
                logger.error('Error joining room:', error);
                socket.emit('error', { 
                    type: 'JOIN_ROOM_ERROR',
                    message: 'Failed to join room',
                    error: error.message 
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

                socket.to(roomId).emit('userLeftRoom', {
                    userId: connection.userId,
                    userName: user?.name,
                    roomId
                });

                socket.emit('leftRoom', { roomId, success: true });
            } catch (error) {
                logger.error('Error leaving room:', error);
            }
        });

        // Handle sending message
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

                // Create message
                const message = await ChatMessage.create({
                    roomId,
                    sender: connection.userId,
                    content: content.trim(),
                    type,
                    attachments,
                    replyTo,
                    readBy: [{ user: connection.userId, readAt: new Date() }]
                });

                // Populate for response
                const populatedMessage = await ChatMessage.findById(message._id)
                    .populate('sender', 'name email isOnline')
                    .populate({
                        path: 'replyTo',
                        select: 'content sender',
                        populate: { path: 'sender', select: 'name' }
                    })
                    .lean();

                // Send to all users in room
                io.to(roomId).emit('newMessage', populatedMessage);

                // Update forum activity
                await Forum.findByIdAndUpdate(roomId, {
                    lastActivity: new Date()
                });

                // Send acknowledgment
                socket.emit('messageSent', {
                    messageId: message._id,
                    timestamp: new Date().toISOString(),
                    success: true
                });

            } catch (error) {
                logger.error('Error sending message:', error);
                socket.emit('error', { 
                    type: 'MESSAGE_ERROR',
                    message: 'Failed to send message',
                    error: error.message 
                });
            }
        });

        // Handle typing indicators
        socket.on('typing', (data) => {
            const connection = connections.get(socket.id);
            if (!connection) return;

            const { roomId, isTyping } = data;
            
            socket.to(roomId).emit('userTyping', {
                userId: connection.userId,
                userName: user?.name,
                isTyping,
                roomId
            });
        });

        // Handle disconnection
        socket.on('disconnect', async (reason) => {
            logger.info(`Socket disconnected: ${socket.id}, reason: ${reason}`);
            
            const connection = connections.get(socket.id);
            
            if (connection) {
                const { userId, roomIds } = connection;
                
                try {
                    // Remove socket from user
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
                            
                            // Notify others user is offline
                            socket.broadcast.emit('userOffline', { 
                                userId,
                                name: userDoc?.name 
                            });
                        }
                    }
                    
                    // Remove from rooms
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
                                    roomId
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
        });
    });

    // Periodic cleanup of stale data
    setInterval(() => {
        const now = Date.now();
        
        // Clean up old heartbeats
        for (const [socketId, lastBeat] of heartbeats) {
            if (now - lastBeat > HEARTBEAT_TIMEOUT * 2) {
                heartbeats.delete(socketId);
            }
        }
        
        // Log stats
        logger.info(`Socket stats - Connections: ${connections.size}, Users: ${userSockets.size}, Rooms with users: ${roomUsers.size}`);
    }, 60000); // Every minute
};