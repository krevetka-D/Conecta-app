// backend/socket/socketHandlers.js
import User from '../models/User.js';
import { getIO } from '../websocket.js';
import roomManager from './roomManager.js';

const socketHandlers = (io) => {
    // Store user socket mappings
    const userSockets = new Map(); // userId -> Set of socketIds
    const socketUsers = new Map(); // socketId -> userId

    io.on('connection', (socket) => {
        console.log('New socket connection:', socket.id);

        socket.on('authenticate', async ({ userId }) => {
            if (!userId) {
                socket.emit('auth_error', { message: 'No userId provided' });
                return;
            }

            try {
                // Store socket-user mapping
                socketUsers.set(socket.id, userId);
                socket.userId = userId; // Store userId on socket for easier access
                
                // Add socket to user's socket set
                if (!userSockets.has(userId)) {
                    userSockets.set(userId, new Set());
                }
                userSockets.get(userId).add(socket.id);

                // Update user status in database
                await User.findByIdAndUpdate(userId, {
                    isOnline: true,
                    lastSeen: new Date(),
                    $addToSet: { socketIds: socket.id }
                });

                // Join user-specific room for targeted updates
                socket.join(`user_${userId}`);
                
                socket.emit('authenticated', { userId });
                
                // Broadcast user came online
                socket.broadcast.emit('user_status_update', {
                    userId,
                    isOnline: true
                });

                console.log(`✅ User ${userId} authenticated with socket ${socket.id}`);
                console.log(`📊 Active connections: ${userSockets.size} users`);
            } catch (error) {
                console.error('Authentication error:', error);
                socket.emit('auth_error', { message: 'Authentication failed' });
            }
        });

        socket.on('disconnect', async () => {
            const userId = socketUsers.get(socket.id);
            
            // Leave all rooms
            roomManager.leaveAllRooms(socket);
            
            if (userId) {
                // Remove this socket from user's set
                const userSocketSet = userSockets.get(userId);
                if (userSocketSet) {
                    userSocketSet.delete(socket.id);
                    
                    // If user has no more sockets, they're offline
                    if (userSocketSet.size === 0) {
                        userSockets.delete(userId);
                        
                        // Update database
                        await User.findByIdAndUpdate(userId, {
                            isOnline: false,
                            lastSeen: new Date(),
                            socketIds: []
                        });

                        // Broadcast user went offline
                        io.emit('user_status_update', {
                            userId,
                            isOnline: false
                        });
                        
                        console.log(`User ${userId} went offline`);
                    }
                }
                
                socketUsers.delete(socket.id);
            }
        });

        // Heartbeat to ensure connection is alive
        socket.on('heartbeat', () => {
            socket.emit('heartbeat_ack');
        });

        // Get online status for specific user
        socket.on('get_user_status', async ({ userId }) => {
            try {
                const user = await User.findById(userId).select('isOnline lastSeen');
                socket.emit('user_status_response', {
                    userId,
                    isOnline: user?.isOnline || false,
                    lastSeen: user?.lastSeen
                });
            } catch (error) {
                console.error('Error getting user status:', error);
            }
        });

        // Get all online users
        socket.on('get_online_users', () => {
            const onlineUserIds = Array.from(userSockets.keys());
            socket.emit('online_users', { users: onlineUserIds });
        });
        
        // Join/leave chat rooms
        socket.on('joinRoom', async (roomId) => {
            if (!roomId) {
                console.error(`❌ No roomId provided for joinRoom from socket ${socket.id}`);
                socket.emit('error', { message: 'Room ID is required' });
                return;
            }
            
            // Use room manager for consistent handling
            const joined = roomManager.joinRoom(socket, roomId);
            
            if (joined) {
                const roomName = `room_${roomId}`;
                const members = roomManager.getRoomMembers(roomId);
                
                // Emit confirmation
                socket.emit('room_joined', { 
                    roomId, 
                    roomName, 
                    memberCount: members.size,
                    success: true 
                });
                
                // Notify other room members
                socket.to(roomName).emit('user_joined_room', {
                    userId: socket.userId,
                    roomId
                });
            } else {
                socket.emit('room_join_error', { 
                    roomId, 
                    error: 'Failed to join room' 
                });
            }
        });
        
        socket.on('leaveRoom', (roomId) => {
            if (roomId) {
                const roomName = `room_${roomId}`;
                
                // Notify other room members before leaving
                socket.to(roomName).emit('user_left_room', {
                    userId: socket.userId,
                    roomId
                });
                
                roomManager.leaveRoom(socket, roomId);
            }
        });
        
        // Handle typing indicators
        socket.on('typing', ({ roomId, recipientId, isTyping }) => {
            if (roomId && socket.userId) {
                socket.to(`room_${roomId}`).emit('user_typing', {
                    userId: socket.userId,
                    roomId,
                    isTyping
                });
            } else if (recipientId) {
                // Personal chat typing indicator
                socket.to(`user_${recipientId}`).emit('user_typing', {
                    userId: socket.userId,
                    isTyping
                });
            }
        });
        
        // Handle personal messages
        socket.on('sendPersonalMessage', async ({ recipientId, content, type, messageId }) => {
            if (!recipientId || !content) {
                socket.emit('error', { message: 'Invalid message data' });
                return;
            }
            
            try {
                // Get the saved message from database if messageId provided
                let messageData;
                if (messageId) {
                    const Message = await import('../models/Message.js').then(m => m.default);
                    messageData = await Message.findById(messageId)
                        .populate('sender', 'name email')
                        .populate('recipient', 'name email')
                        .lean();
                } else {
                    // Fallback message structure
                    messageData = {
                        _id: new Date().getTime().toString(),
                        sender: socket.userId,
                        recipient: recipientId,
                        content,
                        type: type || 'text',
                        createdAt: new Date(),
                        read: false
                    };
                }
                
                // Emit to recipient
                socket.to(`user_${recipientId}`).emit('private_message', messageData);
                
                // Also emit back to sender for confirmation
                socket.emit('private_message', messageData);
                
                console.log(`Personal message sent from ${socket.userId} to ${recipientId}`);
            } catch (error) {
                console.error('Error sending personal message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });
    });

    // Cleanup function to run periodically
    setInterval(async () => {
        try {
            // Find users marked as online but have no active sockets
            const onlineUsers = await User.find({ isOnline: true });
            for (const user of onlineUsers) {
                if (!userSockets.has(user._id.toString())) {
                    await User.findByIdAndUpdate(user._id, {
                        isOnline: false,
                        lastSeen: new Date()
                    });
                    console.log(`Cleaned up offline user: ${user._id}`);
                }
            }
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    }, 60000); // Run every minute
};

export default socketHandlers;