// Test script to verify socket chat functionality
import { io } from 'socket.io-client';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:5001/api';
const SOCKET_URL = 'http://127.0.0.1:5001';

// Test user credentials
const TEST_USER = {
    email: 'test@example.com',
    password: 'test123'
};

const TEST_ROOM_ID = '6874f4dd1d95e7f4551c0d03'; // AI & Tech forum

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function loginUser() {
    try {
        const response = await axios.post(`${API_URL}/users/login`, {
            email: TEST_USER.email,
            password: TEST_USER.password
        });
        
        console.log('✅ Login successful');
        return response.data;
    } catch (error) {
        console.error('❌ Login failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

async function testSocketChat() {
    console.log('🚀 Starting Socket Chat Test...\n');
    
    // Step 1: Login
    const authData = await loginUser();
    const user = authData.user || authData;
    const accessToken = authData.accessToken || authData.token;
    console.log(`👤 Logged in as: ${user.name || user.email} (${user._id})\n`);
    
    // Step 2: Connect to socket
    console.log('🔌 Connecting to socket...');
    const socket = io(SOCKET_URL, {
        transports: ['polling', 'websocket'],
        auth: {
            token: accessToken
        }
    });
    
    // Setup event listeners
    socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id);
        console.log('🔐 Authenticating...');
        socket.emit('authenticate', { userId: user._id });
    });
    
    socket.on('authenticated', (data) => {
        console.log('✅ Socket authenticated:', data);
        console.log(`🚪 Joining room: ${TEST_ROOM_ID}`);
        socket.emit('joinRoom', TEST_ROOM_ID);
    });
    
    socket.on('room_joined', (data) => {
        console.log('✅ Room joined:', data);
    });
    
    socket.on('new_message', (data) => {
        console.log('\n🔔 NEW MESSAGE EVENT RECEIVED:');
        console.log('   Room ID:', data.roomId);
        console.log('   Message ID:', data.message?._id);
        console.log('   Content:', data.message?.content);
        console.log('   Sender:', data.message?.sender?.name);
        console.log('   Full data:', JSON.stringify(data, null, 2));
    });
    
    socket.on('message_sent', (data) => {
        console.log('✅ Message sent confirmation:', data);
    });
    
    socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
    });
    
    socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
    });
    
    // Also listen to all events for debugging
    socket.onAny((event, ...args) => {
        if (!['connect', 'authenticated', 'heartbeat_ack'].includes(event)) {
            console.log(`📡 Socket event: ${event}`, args);
        }
    });
    
    // Wait for connection and auth
    await delay(2000);
    
    // Step 3: Send a test message via API
    console.log('\n📤 Sending test message via API...');
    try {
        const messageResponse = await axios.post(
            `${API_URL}/chat/rooms/${TEST_ROOM_ID}/messages`,
            {
                content: `Test message from socket test script - ${new Date().toISOString()}`,
                type: 'text'
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        
        console.log('✅ Message sent successfully:', {
            id: messageResponse.data._id,
            content: messageResponse.data.content,
            sender: messageResponse.data.sender.name
        });
        
        // Wait for socket event
        console.log('\n⏳ Waiting for socket event...');
        await delay(3000);
        
    } catch (error) {
        console.error('❌ Failed to send message:', error.response?.data || error.message);
    }
    
    // Step 4: Get messages to verify
    console.log('\n📥 Fetching messages from API...');
    try {
        const messagesResponse = await axios.get(
            `${API_URL}/chat/rooms/${TEST_ROOM_ID}/messages?limit=5`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        
        console.log('✅ Messages retrieved:', {
            count: messagesResponse.data.messages?.length || 0,
            lastMessage: messagesResponse.data.messages?.[messagesResponse.data.messages.length - 1]
        });
        
    } catch (error) {
        console.error('❌ Failed to fetch messages:', error.response?.data || error.message);
    }
    
    // Step 5: Test direct socket emission
    console.log('\n📡 Testing direct socket message emission...');
    socket.emit('sendMessage', {
        roomId: TEST_ROOM_ID,
        content: 'Direct socket test message',
        type: 'text'
    });
    
    await delay(2000);
    
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    socket.disconnect();
    
    console.log('\n✅ Test completed!');
    process.exit(0);
}

// Run the test
testSocketChat().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});