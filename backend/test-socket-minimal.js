import { io } from 'socket.io-client';

console.log('Testing minimal socket connection...\n');

// Create socket with minimal config
const socket = io('http://127.0.0.1:5001', {
    transports: ['websocket'],
    autoConnect: false,
    reconnection: false,
    timeout: 10000
});

console.log('Socket created, attempting connection...');

// Add all event listeners before connecting
socket.on('connect', () => {
    console.log('✅ Connected!');
    console.log('Socket ID:', socket.id);
    console.log('Transport:', socket.io.engine.transport.name);
    
    // Try to authenticate
    socket.emit('authenticate', { userId: 'test-user' });
});

socket.on('authenticated', (data) => {
    console.log('✅ Authenticated:', data);
    process.exit(0);
});

socket.on('auth_error', (error) => {
    console.log('❌ Auth error:', error);
    process.exit(1);
});

socket.on('connect_error', (error) => {
    console.log('❌ Connection error:', error.message);
    console.log('Error type:', error.type);
    console.log('Full error:', error);
    process.exit(1);
});

socket.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
});

// Connect
socket.connect();

// Timeout after 10 seconds
setTimeout(() => {
    console.log('⏱️ Timeout reached');
    socket.disconnect();
    process.exit(1);
}, 10000);