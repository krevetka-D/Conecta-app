// backend/socket/socketHandlers.js
import User from '../models/User';

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

                socket.emit('authenticated', { userId });
                
                // Broadcast user came online
                socket.broadcast.emit('user_status_update', {
                    userId,
                    isOnline: true
                });

                console.log(`User ${userId} authenticated with socket ${socket.id}`);
            } catch (error) {
                console.error('Authentication error:', error);
                socket.emit('auth_error', { message: 'Authentication failed' });
            }
        });

        socket.on('disconnect', async () => {
            const userId = socketUsers.get(socket.id);
            
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