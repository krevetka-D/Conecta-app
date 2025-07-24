// Using built-in fetch in Node.js 18+

const API_URL = 'http://localhost:5001/api';

async function testEndpoints() {
    console.log('🔍 Testing API endpoints...\n');
    
    const endpoints = [
        { method: 'GET', path: '/health', name: 'Health Check' },
        { method: 'GET', path: '/chat/updates?since=' + new Date(Date.now() - 60000).toISOString(), name: 'Chat Updates (Polling)' },
        { method: 'GET', path: '/forums/updates?since=' + new Date(Date.now() - 60000).toISOString(), name: 'Forum Updates (Polling)' },
        { method: 'GET', path: '/users/notifications?since=' + new Date(Date.now() - 60000).toISOString(), name: 'User Notifications (Polling)' },
    ];
    
    for (const endpoint of endpoints) {
        try {
            const start = Date.now();
            const response = await fetch(API_URL + endpoint.path, {
                method: endpoint.method,
                headers: {
                    'Content-Type': 'application/json',
                    // Add a test token for protected routes
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZDc2YzhjNGJjNWY3OTQ1MDkyMjMxZiIsIm5hbWUiOiJUZXN0IFVzZXIiLCJpYXQiOjE3MjE4MjE1MTQsImV4cCI6MTcyNDQxMzUxNH0.VN7J8_IXRU6f6L9RJpOOsUQhBz0xpo6F9Y5nz4eSakY'
                }
            });
            
            const time = Date.now() - start;
            const status = response.status;
            const statusText = response.statusText;
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${endpoint.name}: ${status} ${statusText} (${time}ms)`);
                if (data.updates) {
                    console.log(`   Updates: ${data.updates.length}`);
                }
            } else {
                const error = await response.text();
                console.log(`❌ ${endpoint.name}: ${status} ${statusText} (${time}ms)`);
                console.log(`   Error: ${error.substring(0, 100)}...`);
            }
        } catch (error) {
            console.log(`💥 ${endpoint.name}: Network error - ${error.message}`);
        }
        console.log('');
    }
}

// Test WebSocket connection
async function testWebSocket() {
    console.log('🔌 Testing WebSocket connection...\n');
    
    try {
        const io = await import('socket.io-client');
        const socket = io.default('http://localhost:5001', {
            transports: ['polling', 'websocket'],
            query: {
                userId: 'test-user',
                platform: 'test'
            }
        });
        
        socket.on('connect', () => {
            console.log('✅ WebSocket connected:', socket.id);
            setTimeout(() => {
                socket.disconnect();
                process.exit(0);
            }, 2000);
        });
        
        socket.on('connect_error', (error) => {
            console.log('❌ WebSocket connection error:', error.message);
            process.exit(1);
        });
        
    } catch (error) {
        console.log('💥 WebSocket test error:', error.message);
    }
}

// Run tests
console.log('🚀 API Health Check\n');
console.log('Backend URL: http://localhost:5001/api');
console.log('Testing at:', new Date().toISOString());
console.log('=' .repeat(50) + '\n');

testEndpoints().then(() => testWebSocket());