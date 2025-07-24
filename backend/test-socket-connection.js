import { io } from 'socket.io-client';

const testSocketConnection = async () => {
    console.log('Testing Socket.IO connection...\n');
    
    const serverUrl = 'http://localhost:5001';
    
    // Test with polling transport only (mimicking React Native)
    const socket = io(serverUrl, {
        transports: ['polling'],
        forceNew: true,
        path: '/socket.io/',
        query: {
            userId: 'test-user-123',
            platform: 'test'
        },
        auth: {
            token: 'test-token'
        },
        withCredentials: false,
        extraHeaders: {
            'X-Platform': 'test',
            'X-App-Version': '1.0.0'
        }
    });
    
    // Set up event handlers
    socket.on('connect', () => {
        console.log('✅ Connected successfully!');
        console.log('Socket ID:', socket.id);
        console.log('Transport:', socket.io.engine.transport.name);
        
        // Test authentication
        socket.emit('authenticate', { userId: 'test-user-123' });
    });
    
    socket.on('authenticated', (data) => {
        console.log('✅ Authentication successful:', data);
        
        // Test a simple echo
        socket.emit('echo', { message: 'Hello from test client!' });
        
        // Clean disconnect after 2 seconds
        setTimeout(() => {
            socket.disconnect();
            console.log('\n🔌 Disconnected from server');
            process.exit(0);
        }, 2000);
    });
    
    socket.on('auth_error', (error) => {
        console.error('❌ Authentication error:', error);
    });
    
    socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', {
            message: error.message,
            type: error.type,
            data: error.data
        });
    });
    
    socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
    });
    
    socket.on('disconnect', (reason) => {
        console.log('Disconnected:', reason);
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
        console.error('\n❌ Connection timeout after 10 seconds');
        socket.disconnect();
        process.exit(1);
    }, 10000);
};

// Run the test
testSocketConnection().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});