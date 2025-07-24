import { io } from 'socket.io-client';

console.log('Testing direct socket connection...\n');

// Test different connection methods
const tests = [
    {
        name: 'Polling only',
        options: {
            transports: ['polling'],
            forceNew: true
        }
    },
    {
        name: 'WebSocket only',
        options: {
            transports: ['websocket'],
            forceNew: true
        }
    },
    {
        name: 'Both transports',
        options: {
            transports: ['polling', 'websocket'],
            forceNew: true
        }
    }
];

async function testConnection(name, options) {
    console.log(`\n🔍 Testing: ${name}`);
    console.log('Options:', JSON.stringify(options, null, 2));
    
    return new Promise((resolve) => {
        const socket = io('http://127.0.0.1:5001', options);
        
        const timeout = setTimeout(() => {
            console.log('❌ Connection timeout');
            socket.disconnect();
            resolve(false);
        }, 5000);
        
        socket.on('connect', () => {
            clearTimeout(timeout);
            console.log('✅ Connected!');
            console.log('Socket ID:', socket.id);
            console.log('Transport:', socket.io.engine.transport.name);
            socket.disconnect();
            resolve(true);
        });
        
        socket.on('connect_error', (error) => {
            clearTimeout(timeout);
            console.log('❌ Connection error:', error.message);
            console.log('Error type:', error.type);
            socket.disconnect();
            resolve(false);
        });
        
        socket.io.on('error', (error) => {
            console.log('❌ Engine error:', error);
        });
    });
}

// Run all tests
async function runTests() {
    for (const test of tests) {
        await testConnection(test.name, test.options);
    }
    
    console.log('\n✨ Tests complete!\n');
    process.exit(0);
}

runTests();