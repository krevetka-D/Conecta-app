const io = require('socket.io-client');

const testSocketConnection = async () => {
    console.log('Testing Socket.IO connection to backend...');
    
    const socketUrl = 'http://192.168.1.129:5001';
    console.log(`Connecting to: ${socketUrl}`);
    
    const socket = io(socketUrl, {
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        timeout: 20000,
        auth: {
            token: 'test-token'
        },
        query: {
            userId: 'test-user-id',
            platform: 'test'
        }
    });
    
    socket.on('connect', () => {
        console.log('✅ Connected successfully!');
        console.log('Socket ID:', socket.id);
        console.log('Transport:', socket.io.engine.transport.name);
    });
    
    socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error.message);
        console.error('Error type:', error.type);
    });
    
    socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected:', reason);
    });
    
    socket.on('authenticated', (data) => {
        console.log('✅ Authenticated:', data);
    });
    
    socket.on('auth_error', (error) => {
        console.error('❌ Authentication error:', error);
    });
    
    // Give it some time to connect
    setTimeout(() => {
        if (socket.connected) {
            console.log('✅ Socket is still connected after 5 seconds');
        } else {
            console.log('❌ Socket failed to stay connected');
        }
        socket.disconnect();
        process.exit(0);
    }, 5000);
};

testSocketConnection();