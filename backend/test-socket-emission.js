/**
 * Test script to verify socket message emission
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initSocket, getIO } from './websocket.js';
import ChatMessage from './models/ChatMessage.js';
import Forum from './models/Forum.js';
import User from './models/User.js';

dotenv.config();

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erasmus');
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

// Test socket emission
async function testSocketEmission() {
    // Setup HTTP server and Socket.IO
    const httpServer = createServer();
    const io = initSocket(httpServer);
    
    // Start server
    const PORT = 3001; // Different port to avoid conflicts
    httpServer.listen(PORT, () => {
        console.log(`✅ Test server running on port ${PORT}`);
    });
    
    // Wait for a client to connect
    io.on('connection', (socket) => {
        console.log('👤 Client connected:', socket.id);
        
        socket.on('authenticate', ({ userId }) => {
            console.log(`🔐 User ${userId} authenticated`);
            socket.emit('authenticated', { userId });
            socket.userId = userId;
        });
        
        socket.on('joinRoom', (roomId) => {
            socket.join(`room_${roomId}`);
            console.log(`✅ Socket ${socket.id} joined room_${roomId}`);
        });
    });
    
    // Wait a bit for setup
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get a test room
    const testRoom = await Forum.findOne({ isActive: true });
    if (!testRoom) {
        console.error('❌ No active forum/room found');
        return;
    }
    
    console.log(`📍 Using test room: ${testRoom.title} (${testRoom._id})`);
    
    // Get a test user
    const testUser = await User.findOne();
    if (!testUser) {
        console.error('❌ No user found');
        return;
    }
    
    console.log(`👤 Using test user: ${testUser.name} (${testUser._id})`);
    
    // Create a test message
    const testMessage = {
        roomId: testRoom._id,
        sender: testUser._id,
        content: `Test message at ${new Date().toISOString()}`,
        type: 'text'
    };
    
    // Save to database
    const savedMessage = await ChatMessage.create(testMessage);
    const populatedMessage = await ChatMessage.findById(savedMessage._id)
        .populate('sender', 'name email isOnline lastSeen')
        .lean();
    
    console.log('💾 Message saved to database:', populatedMessage._id);
    
    // Test emission
    console.log(`\n📤 Testing socket emission to room_${testRoom._id}...`);
    
    // Get room sockets
    const roomSockets = await io.in(`room_${testRoom._id}`).fetchSockets();
    console.log(`👥 Sockets in room: ${roomSockets.length}`);
    
    // Emit the message
    io.to(`room_${testRoom._id}`).emit('new_message', {
        roomId: testRoom._id,
        message: populatedMessage,
        timestamp: new Date()
    });
    
    console.log('✅ Message emitted to room');
    
    // Also test global emission
    io.emit('new_message', {
        roomId: testRoom._id,
        content: populatedMessage.content,
        sender: populatedMessage.sender,
        createdAt: populatedMessage.createdAt
    });
    
    console.log('✅ Message emitted globally');
    
    // Keep server running for a bit to see if clients receive
    console.log('\n⏳ Waiting 10 seconds for client responses...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Cleanup
    httpServer.close();
    await mongoose.connection.close();
    console.log('\n🏁 Test complete');
}

// Run the test
(async () => {
    try {
        await connectDB();
        await testSocketEmission();
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
})();