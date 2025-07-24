import io from 'socket.io-client';
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5001';
const TEST_USER = {
    email: 'test@example.com',
    password: 'password123'
};

async function loginUser() {
    try {
        const response = await fetch(`${API_URL}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_USER)
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        console.log('✅ Logged in successfully');
        return data.token;
    } catch (error) {
        console.error('❌ Login failed:', error.message);
        throw error;
    }
}

async function testSocketChat() {
    console.log('🚀 Starting Socket.IO Chat Test...\n');
    
    try {
        // 1. Login to get token
        const token = await loginUser();
        
        // 2. Connect to socket
        console.log('\n📡 Connecting to Socket.IO...');
        const socket = io(API_URL, {
            auth: { token },
            transports: ['websocket', 'polling']
        });
        
        // 3. Set up event listeners
        socket.on('connect', () => {
            console.log('✅ Connected to Socket.IO');
            console.log('   Socket ID:', socket.id);
            
            // 4. Authenticate
            socket.emit('authenticate', { token });
        });
        
        socket.on('authenticated', () => {
            console.log('✅ Socket authenticated');
            
            // 5. Join a test room
            const roomId = '674ccfc0cc1b4e8e3093c54f'; // Replace with actual room ID
            console.log(`\n🚪 Joining room: ${roomId}`);
            socket.emit('joinRoom', roomId);
            
            // 6. Listen for messages
            socket.on('new_message', (data) => {
                console.log('\n📨 NEW MESSAGE RECEIVED:');
                console.log('   Room ID:', data.roomId);
                console.log('   Message:', data.message?.content);
                console.log('   Sender:', data.message?.sender?.name);
                console.log('   Timestamp:', new Date(data.timestamp).toLocaleTimeString());
            });
            
            // 7. Send a test message after joining
            setTimeout(() => {
                console.log('\n📤 Sending test message via API...');
                sendTestMessage(token, roomId);
            }, 2000);
        });
        
        socket.on('error', (error) => {
            console.error('❌ Socket error:', error);
        });
        
        socket.on('disconnect', (reason) => {
            console.log('🔌 Disconnected:', reason);
        });
        
        // Listen to all events for debugging
        socket.onAny((eventName, ...args) => {
            if (!['connect', 'authenticated', 'new_message'].includes(eventName)) {
                console.log(`📡 Event: ${eventName}`, args);
            }
        });
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

async function sendTestMessage(token, roomId) {
    try {
        const response = await fetch(`${API_URL}/api/chat/rooms/${roomId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                content: `Test message at ${new Date().toLocaleTimeString()}`,
                type: 'text'
            })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        console.log('✅ Message sent successfully');
        console.log('   Message ID:', data._id);
    } catch (error) {
        console.error('❌ Failed to send message:', error.message);
    }
}

// Run the test
testSocketChat();

// Keep the process alive
process.stdin.resume();