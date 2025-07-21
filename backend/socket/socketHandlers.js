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
    const heartbeatInterval = 30000; // 30 seconds
    const heartbeats = new Map(); // socketId -> lastHeartbeat
    
    // Start heartbeat checker
    setInterval(() => {
        const now = Date.now();
        for (const [socketId, lastBeat] of heartbeats) {
            if (now - lastBeat > heartbeatInterval * 2) {
                const socket = io.sockets.sockets.get(socketId);
                if (socket) {
                    console.log(`Disconnecting inactive socket: ${socketId}`);
                    socket.disconnect(true);
                }
                heartbeats.delete(socketId);
            }
        }
    }, heartbeatInterval);

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        
        // Initialize heartbeat
        heartbeats.set(socket.id, Date.now());
        
        // Send connection acknowledgment
        socket.emit('connected', {
            socketId: socket.id,
            timestamp: new Date().toISOString()
        });

        // Handle heartbeat
        socket.on('heartbeat', () => {
            heartbeats.set(socket.id, Date.now());
            socket.emit('heartbeat_ack');
        });

        // Enhanced authentication handler
        socket.on('authenticate', async (data) => {
            try {
                const { userId } = data;
                
                if (!userId) {
                    return socket.emit('auth_error', { 
                        message: 'User ID required for authentication' 
                    });
                }

                // Store connection info
                connections.set(socket.id, { userId, roomIds: new Set() });
                
                // Track user sockets
                if (!userSockets.has(userId)) {
                    userSockets.set(userId, new Set());
                }
                userSockets.get(userId).add(socket.id);

                // Update user online status
                await User.findByIdAndUpdate(userId, { 
                    isOnline: true,
                    lastSeen: new Date()
                });

                // Join user's personal room
                socket.join(`user_${userId}`);

                socket.emit('authenticated', { 
                    success: true,
                    userId,
                    timestamp: new Date().toISOString()
                });

                // Notify others about user online
                socket.broadcast.emit('userOnline', { userId });

                logger.info(`User ${userId} authenticated on socket ${socket.id}`);
            } catch (error) {
                logger.error('Authentication error:', error);
                socket.emit('auth_error', { 
                    message: 'Authentication failed',
                    error: error.message 
                });
            }
        });

        // Enhanced room join handler
        socket.on('joinRoom', async (roomId) => {
            try {
                const connection = connections.get(socket.id);
                
                if (!connection) {
                    return socket.emit('error', { 
                        message: 'Not authenticated',
                        code: 'NOT_AUTHENTICATED'
                    });
                }

                // Verify room exists
                const room = await Forum.findById(roomId);
                if (!room) {
                    return socket.emit('error', { 
                        message: 'Room not found',
                        code: 'ROOM_NOT_FOUND'
                    });
                }

                // Join the room
                socket.join(roomId);
                connection.roomIds.add(roomId);

                // Track room users
                if (!roomUsers.has(roomId)) {
                    roomUsers.set(roomId, new Set());
                }
                roomUsers.get(roomId).add(connection.userId);

                // Load and send recent messages
                try {
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
                    .lean();

                    socket.emit('roomMessages', messages.reverse());
                } catch (error) {
                    logger.error('Error loading messages:', error);
                    socket.emit('roomMessages', []);
                }

                // Send room users
                const users = Array.from(roomUsers.get(roomId) || []);
                io.to(roomId).emit('roomUsers', users);

                // Notify others
                socket.to(roomId).emit('userJoinedRoom', {
                    userId: connection.userId,
                    roomId,
                    timestamp: new Date().toISOString()
                });

                socket.emit('joinedRoom', {
                    roomId,
                    success: true
                });

                logger.info(`User ${connection.userId} joined room ${roomId}`);
            } catch (error) {
                logger.error('Error joining room:', error);
                socket.emit('error', { 
                    message: 'Failed to join room',
                    error: error.message 
                });
            }
        });

        // Enhanced message handler
        socket.on('sendMessage', async (data) => {
            try {
                const connection = connections.get(socket.id);
                
                if (!connection) {
                    return socket.emit('error', { 
                        message: 'Not authenticated',
                        code: 'NOT_AUTHENTICATED'
                    });
                }

                const { roomId, content, type = 'text', attachments, replyTo } = data;

                // Validate input
                if (!roomId || !content?.trim()) {
                    return socket.emit('error', { 
                        message: 'Invalid message data',
                        code: 'INVALID_DATA'
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
                    .populate('sender', 'name email')
                    .populate({
                        path: 'replyTo',
                        select: 'content sender',
                        populate: { path: 'sender', select: 'name' }
                    })
                    .lean();

                // Send to all users in room
                io.to(roomId).emit('newMessage', populatedMessage);

                // Update forum activity
                Forum.findByIdAndUpdate(roomId, {
                    lastActivity: new Date()
                }).exec().catch(err => logger.error('Error updating forum activity:', err));

                // Send acknowledgment
                socket.emit('messageSent', {
                    messageId: message._id,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                logger.error('Error sending message:', error);
                socket.emit('error', { 
                    message: 'Failed to send message',
                    error: error.message 
                });
            }
        });

        // Handle disconnection
        socket.on('disconnect', async (reason) => {
            logger.info(`Socket disconnected: ${socket.id}, reason: ${reason}`);
            
            const connection = connections.get(socket.id);
            
            if (connection) {
                const { userId, roomIds } = connection;
                
                // Remove from user sockets
                const sockets = userSockets.get(userId);
                if (sockets) {
                    sockets.delete(socket.id);
                    
                    // If user has no more sockets, mark as offline
                    if (sockets.size === 0) {
                        userSockets.delete(userId);
                        
                        // Update user status
                        await User.findByIdAndUpdate(userId, {
                            isOnline: false,
                            lastSeen: new Date()
                        });
                        
                        // Notify others
                        socket.broadcast.emit('userOffline', { userId });
                    }
                }
                
                // Remove from rooms
                for (const roomId of roomIds) {
                    const users = roomUsers.get(roomId);
                    if (users) {
                        users.delete(userId);
                        if (users.size === 0) {
                            roomUsers.delete(roomId);
                        }
                    }
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
};