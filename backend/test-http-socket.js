import http from 'http';

// Test if Socket.IO endpoint is responding
const testSocketEndpoint = () => {
    const options = {
        hostname: '127.0.0.1',
        port: 5001,
        path: '/socket.io/?EIO=4&transport=polling',
        method: 'GET',
        headers: {
            'User-Agent': 'node-test-client'
        }
    };

    console.log('Testing Socket.IO endpoint...');
    console.log(`GET http://${options.hostname}:${options.port}${options.path}`);

    const req = http.request(options, (res) => {
        console.log(`\nStatus Code: ${res.statusCode}`);
        console.log('Headers:', res.headers);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('\nResponse body:');
            console.log(data);
            
            if (res.statusCode === 200) {
                console.log('\n✅ Socket.IO endpoint is accessible!');
            } else {
                console.log('\n❌ Socket.IO endpoint returned error');
            }
            process.exit(0);
        });
    });

    req.on('error', (error) => {
        console.error('\n❌ Request failed:', error.message);
        process.exit(1);
    });

    req.end();
};

// Wait for server to be ready
setTimeout(testSocketEndpoint, 1000);