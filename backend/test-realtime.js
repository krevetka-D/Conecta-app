import io from 'socket.io-client';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';
const SOCKET_URL = 'http://localhost:5001';

// Test user credentials
const testUser = {
    email: 'user1@example.com',
    password: '123456'
};

async function testRealTimeUpdates() {
    try {
        console.log('🧪 Testing Real-Time Updates...\n');
        
        // 1. Login to get token
        console.log('1. Logging in...');
        const loginResponse = await axios.post(`${API_URL}/users/login`, testUser);
        const { token, _id: userId } = loginResponse.data;
        console.log(`✅ Logged in as user: ${userId}\n`);
        
        // 2. Connect to socket
        console.log('2. Connecting to WebSocket...');
        const socket = io(SOCKET_URL, {
            auth: { token },
            query: { userId },
            transports: ['websocket']
        });
        
        await new Promise((resolve) => {
            socket.on('connect', () => {
                console.log(`✅ Connected to WebSocket with ID: ${socket.id}`);
                resolve();
            });
        });
        
        // 3. Authenticate socket
        console.log('\n3. Authenticating socket...');
        socket.emit('authenticate', { userId });
        
        await new Promise((resolve) => {
            socket.on('authenticated', (data) => {
                console.log('✅ Socket authenticated:', data);
                resolve();
            });
        });
        
        // 4. Set up event listeners
        console.log('\n4. Setting up real-time event listeners...');
        
        // Budget updates
        socket.on('budget_update', (data) => {
            console.log('💰 Budget Update:', data);
        });
        
        // Checklist updates
        socket.on('checklist_update', (data) => {
            console.log('✅ Checklist Update:', data);
        });
        
        // Event updates
        socket.on('event_update', (data) => {
            console.log('📅 Event Update:', data);
        });
        
        // Forum updates
        socket.on('forum_update', (data) => {
            console.log('💬 Forum Update:', data);
        });
        
        // New messages
        socket.on('new_message', (data) => {
            console.log('💌 New Message:', data);
        });
        
        console.log('✅ All listeners set up\n');
        
        // 5. Test budget real-time update
        console.log('5. Testing Budget real-time update...');
        await axios.post(`${API_URL}/budget`, {
            type: 'EXPENSE',
            category: 'Test Category',
            amount: 100,
            description: 'Real-time test',
            entryDate: new Date()
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // Wait for real-time event
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('\n✅ Real-time update test completed!');
        console.log('Check if you received the budget_update event above.');
        
        // Keep connection open for 5 seconds to receive any delayed events
        setTimeout(() => {
            socket.disconnect();
            process.exit(0);
        }, 5000);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testRealTimeUpdates();