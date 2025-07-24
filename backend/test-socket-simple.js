import { io } from 'socket.io-client';

const testSocket = async () => {
    console.log('Testing Socket.IO connection to localhost:5001...\n');
    
    // Test with minimal configuration
    const socket = io('http://127.0.0.1:5001', {
        transports: ['polling'],
        path: '/socket.io/',
        autoConnect: true,
        reconnection: false
    });
    
    socket.on('connect', () => {
        console.log('✅ Connected!');
        console.log('Socket ID:', socket.id);
        console.log('Transport:', socket.io.engine.transport.name);
        process.exit(0);
    });
    
    socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error.message);
        console.error('Error type:', error.type);
        console.error('Error details:', error);
        process.exit(1);
    });
    
    // Timeout
    setTimeout(() => {
        console.error('❌ Connection timeout');
        process.exit(1);
    }, 5000);
};

testSocket();