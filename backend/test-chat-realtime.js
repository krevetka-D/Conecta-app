// Test script to verify chat real-time functionality
const io = require('socket.io-client');
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';
const SOCKET_URL = 'http://localhost:5001';

// Test users - you'll need valid tokens
const USER1_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzUzNjQ3OTQ5NjZlMTY1MDE2ZWQ2YmIiLCJpYXQiOjE3MzM1MDc0MDAsImV4cCI6MTczMzU5MzgwMH0.s2UfKxz0QxoXTLaZO6aM-s5qjbU-nYp_fJJxyMJ-kFU';
const USER1_ID = '675364794966e165016ed6bb';

const USER2_TOKEN = 'YOUR_USER2_TOKEN'; // Replace with actual token
const USER2_ID = 'YOUR_USER2_ID'; // Replace with actual user ID

// Test room ID (use an existing forum/room ID)
const TEST_ROOM_ID = '67539fa5cf8b491c5cfb0f87'; // Replace with actual room ID

async function testChatRealtime() {
    console.log('🧪 Testing Chat Real-time Functionality...\n');

    // Create axios instances for both users
    const user1Api = axios.create({
        baseURL: API_BASE_URL,
        headers: { 'Authorization': `Bearer ${USER1_TOKEN}` }
    });

    const user2Api = axios.create({
        baseURL: API_BASE_URL,
        headers: { 'Authorization': `Bearer ${USER2_TOKEN}` }
    });

    // Connect both users via socket
    console.log('1️⃣ Connecting User 1 to socket...');
    const socket1 = io(SOCKET_URL, {
        auth: { token: USER1_TOKEN },
        transports: ['websocket']
    });

    console.log('2️⃣ Connecting User 2 to socket...');
    const socket2 = io(SOCKET_URL, {
        auth: { token: USER2_TOKEN },
        transports: ['websocket']
    });

    // Wait for connections
    await Promise.all([
        new Promise(resolve => socket1.once('connect', resolve)),
        new Promise(resolve => socket2.once('connect', resolve))
    ]);

    console.log('✅ Both users connected\n');

    // Authenticate users
    socket1.emit('authenticate', { userId: USER1_ID });
    socket2.emit('authenticate', { userId: USER2_ID });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Join room
    console.log(`3️⃣ Joining room ${TEST_ROOM_ID}...`);
    socket1.emit('joinRoom', TEST_ROOM_ID);
    socket2.emit('joinRoom', TEST_ROOM_ID);

    await new Promise(resolve => setTimeout(resolve, 500));

    // Set up message listeners
    const user2Messages = [];
    socket2.on('new_message', (data) => {
        console.log('📨 User 2 received message:', data);
        user2Messages.push(data);
    });

    socket2.on('user_typing', (data) => {
        console.log('⌨️ User 2 sees typing indicator:', data);
    });

    // Test typing indicator
    console.log('\n4️⃣ Testing typing indicator...');
    socket1.emit('typing', { roomId: TEST_ROOM_ID, isTyping: true });
    await new Promise(resolve => setTimeout(resolve, 1000));
    socket1.emit('typing', { roomId: TEST_ROOM_ID, isTyping: false });

    // Send a test message
    console.log('\n5️⃣ User 1 sending message...');
    try {
        const response = await user1Api.post(`/chat/rooms/${TEST_ROOM_ID}/messages`, {
            content: `Test message from real-time test script - ${new Date().toISOString()}`,
            type: 'text'
        });
        console.log('✅ Message sent:', response.data._id);
    } catch (error) {
        console.error('❌ Failed to send message:', error.response?.data || error.message);
    }

    // Wait for message to be received
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check results
    console.log('\n📊 Test Results:');
    console.log(`- Socket 1 connected: ${socket1.connected}`);
    console.log(`- Socket 2 connected: ${socket2.connected}`);
    console.log(`- Messages received by User 2: ${user2Messages.length}`);
    
    if (user2Messages.length > 0) {
        console.log('✅ Real-time messaging is working!');
        console.log('Message details:', user2Messages[0]);
    } else {
        console.log('❌ Real-time messaging is NOT working');
        console.log('Possible issues:');
        console.log('1. Users not authenticated properly');
        console.log('2. Room join failed');
        console.log('3. Message event not emitted correctly');
        console.log('4. Socket listeners not set up properly');
    }

    // Cleanup
    socket1.disconnect();
    socket2.disconnect();
}

// Run the test
testChatRealtime().catch(console.error);