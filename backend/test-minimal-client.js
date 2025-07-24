import { io } from 'socket.io-client';

console.log('Testing minimal Socket.IO connection...\n');

// Connect with absolute minimal options
const socket = io('http://127.0.0.1:5001', {
    transports: ['polling'],
    autoConnect: false,
    query: {
        userId: 'test-user-123'
    }
});

// Manual connect
console.log('Attempting to connect...');
socket.connect();

socket.on('connect', () => {
    console.log('✅ Connected!');
    console.log('Socket ID:', socket.id);
    process.exit(0);
});

socket.on('connect_error', (error) => {
    console.error('❌ Connection error:');
    console.error('Message:', error.message);
    console.error('Type:', error.type);
    if (error.data) {
        console.error('Data:', error.data);
    }
    process.exit(1);
});

setTimeout(() => {
    console.error('❌ Timeout after 5 seconds');
    process.exit(1);
}, 5000);