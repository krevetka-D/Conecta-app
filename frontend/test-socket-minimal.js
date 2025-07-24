const http = require('http');

// Test basic socket.io polling endpoint
const testPolling = () => {
    const options = {
        hostname: '192.168.1.129',
        port: 5001,
        path: '/socket.io/?EIO=4&transport=polling',
        method: 'GET',
        headers: {
            'Accept': '*/*',
            'Origin': 'http://localhost:8081',
            'User-Agent': 'node-test'
        }
    };

    console.log('Testing polling endpoint...');
    
    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('BODY:', data);
            
            // If we got a session ID, try to establish connection
            if (res.statusCode === 200 && data.includes('sid')) {
                const sid = JSON.parse(data.substring(1)).sid;
                console.log('\nGot session ID:', sid);
                testPost(sid);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
    });

    req.end();
};

const testPost = (sid) => {
    const postData = '40'; // Socket.IO connect packet
    
    const options = {
        hostname: '192.168.1.129',
        port: 5001,
        path: `/socket.io/?EIO=4&transport=polling&sid=${sid}`,
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=UTF-8',
            'Content-Length': Buffer.byteLength(postData),
            'Origin': 'http://localhost:8081',
            'User-Agent': 'node-test'
        }
    };

    console.log('\nTesting POST to establish connection...');
    
    const req = http.request(options, (res) => {
        console.log(`POST STATUS: ${res.statusCode}`);
        console.log(`POST HEADERS: ${JSON.stringify(res.headers)}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('POST BODY:', data);
        });
    });

    req.on('error', (e) => {
        console.error(`POST error: ${e.message}`);
    });

    req.write(postData);
    req.end();
};

testPolling();