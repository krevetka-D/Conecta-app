/**
 * Test current state of backend and identify issues
 */

async function testBackend() {
    console.log('🔍 Testing Backend State...\n');
    
    // Test 1: Basic connectivity
    console.log('1. Testing basic connectivity...');
    try {
        const response = await fetch('http://localhost:5001/api/health');
        const data = await response.json();
        console.log('✅ Backend is running:', data.status);
        console.log('   Uptime:', Math.floor(data.uptime / 60), 'minutes');
        console.log('   Memory:', Math.floor(data.memoryUsage.heapUsed / 1024 / 1024), 'MB');
    } catch (error) {
        console.log('❌ Backend connection failed:', error.message);
        return;
    }
    
    // Test 2: Database connection
    console.log('\n2. Testing database connection...');
    try {
        const response = await fetch('http://localhost:5001/api/forums');
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Database connected, forums count:', Array.isArray(data) ? data.length : 'N/A');
        } else {
            console.log('❌ Database error:', response.status, response.statusText);
        }
    } catch (error) {
        console.log('❌ Database test failed:', error.message);
    }
    
    // Test 3: WebSocket
    console.log('\n3. Testing WebSocket...');
    try {
        const io = (await import('socket.io-client')).default;
        const socket = io('http://localhost:5001', {
            transports: ['polling'],
            timeout: 5000
        });
        
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                socket.disconnect();
                reject(new Error('Connection timeout'));
            }, 5000);
            
            socket.on('connect', () => {
                clearTimeout(timeout);
                console.log('✅ WebSocket connected:', socket.id);
                socket.disconnect();
                resolve();
            });
            
            socket.on('connect_error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });
    } catch (error) {
        console.log('❌ WebSocket failed:', error.message);
    }
    
    // Test 4: Polling endpoints
    console.log('\n4. Testing polling endpoints...');
    const pollingEndpoints = [
        '/chat/updates',
        '/forums/updates', 
        '/users/notifications'
    ];
    
    for (const endpoint of pollingEndpoints) {
        try {
            const response = await fetch(`http://localhost:5001/api${endpoint}?since=${new Date().toISOString()}`);
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${endpoint}: Working (${data.updates?.length || 0} updates)`);
            } else {
                const text = await response.text();
                console.log(`❌ ${endpoint}: ${response.status} - ${text.substring(0, 50)}...`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint}: ${error.message}`);
        }
    }
    
    console.log('\n✨ Test complete!');
}

// Run the test
testBackend().catch(console.error);