import ChatMessage from '../models/ChatMessage.js';
import Forum from '../models/Forum.js';
import User from '../models/User.js';

export const setupSocketHandlers = (io) => {
    // Track online users
    const onlineUsers = new Map();

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // Handle user authentication
        socket.on('authenticate', async (data) => {
            const { userId } = data;
            if (userId) {
                socket.userId = userId;
                onlineUsers.set(userId, socket.id);
                
                // Update user online status
                await User.findByIdAndUpdate(userId, { 
                    isOnline: true,
                    lastSeen: new Date()
                });

                // Notify others that user is online
                socket.broadcast.emit('userOnline', { userId });
            }
        });

        // Join a chat room (forum)
        socket.on('joinRoom', async (roomId) => {
            try {
                socket.join(roomId);
                
                // Get recent messages
                const messages = await ChatMessage.find({ roomId })
                    .populate('sender', 'name email')
                    .populate('replyTo', 'content sender')
                    .sort({ createdAt: -1 })
                    .limit(50)
                    .lean();

                // Send messages to the user
                socket.emit('roomMessages', messages.reverse());

                // Get online users in room
                const roomUsers = await getUsersInRoom(io, roomId);
                socket.emit('roomUsers', roomUsers);

                // Notify others in room
                socket.to(roomId).emit('userJoinedRoom', {
                    userId: socket.userId,
                    roomId
                });
            } catch (error) {
                console.error('Error joining room:', error);
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        // Handle sending messages
        socket.on('sendMessage', async (data) => {
            try {
                const { roomId, content, type = 'text', attachments, replyTo } = data;

                // Create message
                const message = await ChatMessage.create({
                    roomId,
                    sender: socket.userId,
                    content,
                    type,
                    attachments,
                    replyTo
                });

                // Populate sender info
                await message.populate('sender', 'name email');
                if (replyTo) {
                    await message.populate('replyTo', 'content sender');
                }

                // Send to all users in room (including sender)
                io.to(roomId).emit('newMessage', message);

                // Update forum last activity
                await Forum.findByIdAndUpdate(roomId, {
                    lastActivity: new Date()
                });

            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Handle typing indicators
        socket.on('typing', ({ roomId, isTyping }) => {
            socket.to(roomId).emit('userTyping', {
                userId: socket.userId,
                isTyping
            });
        });

        // Handle message reactions
        socket.on('addReaction', async ({ messageId, emoji }) => {
            try {
                const message = await ChatMessage.findById(messageId);
                if (!message) return;

                // Remove existing reaction from this user
                message.reactions = message.reactions.filter(
                    r => r.user.toString() !== socket.userId
                );

                // Add new reaction
                message.reactions.push({
                    user: socket.userId,
                    emoji
                });

                await message.save();

                // Notify room members
                io.to(message.roomId.toString()).emit('messageReaction', {
                    messageId,
                    reactions: message.reactions
                });
            } catch (error) {
                console.error('Error adding reaction:', error);
            }
        });

        // Handle message deletion
        socket.on('deleteMessage', async ({ messageId }) => {
            try {
                const message = await ChatMessage.findById(messageId);
                if (!message || message.sender.toString() !== socket.userId) {
                    return socket.emit('error', { message: 'Unauthorized' });
                }

                message.deleted = true;
                await message.save();

                // Notify room members
                io.to(message.roomId.toString()).emit('messageDeleted', { messageId });
            } catch (error) {
                console.error('Error deleting message:', error);
            }
        });

        // Handle disconnect
        socket.on('disconnect', async () => {
            console.log('Client disconnected:', socket.id);
            
            if (socket.userId) {
                onlineUsers.delete(socket.userId);
                
                // Update user offline status
                await User.findByIdAndUpdate(socket.userId, {
                    isOnline: false,
                    lastSeen: new Date()
                });

                // Notify others
                socket.broadcast.emit('userOffline', { userId: socket.userId });
            }
        });
    });

    // Helper function to get users in a room
    async function getUsersInRoom(io, roomId) {
        const room = io.sockets.adapter.rooms.get(roomId);
        if (!room) return [];

        const userIds = [];
        for (const socketId of room) {
            const socket = io.sockets.sockets.get(socketId);
            if (socket && socket.userId) {
                userIds.push(socket.userId);
            }
        }

        return User.find({ _id: { $in: userIds } })
            .select('name email isOnline')
            .lean();
    }
};