/**
 * Real-time log monitoring and analysis
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Track error patterns
const errorPatterns = {
    connection: /connection|connect|socket|websocket/i,
    api: /api|fetch|axios|request/i,
    auth: /auth|token|unauthorized|401|403/i,
    database: /mongo|database|db/i,
    performance: /timeout|slow|performance/i
};

const stats = {
    errors: 0,
    warnings: 0,
    apiCalls: 0,
    socketEvents: 0,
    startTime: Date.now()
};

// Analyze log line
function analyzeLine(line) {
    const timestamp = new Date().toISOString();
    
    // Check for errors
    if (line.includes('ERROR') || line.includes('Error') || line.includes('failed')) {
        stats.errors++;
        console.log(`${colors.red}[ERROR] ${timestamp}${colors.reset}`);
        console.log(`  ${line.trim()}`);
        
        // Categorize error
        for (const [category, pattern] of Object.entries(errorPatterns)) {
            if (pattern.test(line)) {
                console.log(`  ${colors.yellow}Category: ${category}${colors.reset}`);
            }
        }
        console.log('');
    }
    
    // Check for warnings
    else if (line.includes('WARN') || line.includes('Warning')) {
        stats.warnings++;
        console.log(`${colors.yellow}[WARN] ${timestamp}${colors.reset}`);
        console.log(`  ${line.trim()}`);
        console.log('');
    }
    
    // Track API calls
    else if (line.includes('API') || line.includes('/api/')) {
        stats.apiCalls++;
        if (line.includes('200')) {
            console.log(`${colors.green}[API] ${timestamp} - Success${colors.reset}`);
        } else if (line.includes('4') || line.includes('5')) {
            console.log(`${colors.red}[API] ${timestamp} - Error${colors.reset}`);
        }
        console.log(`  ${line.trim()}`);
        console.log('');
    }
    
    // Track Socket events
    else if (line.includes('Socket') || line.includes('socket')) {
        stats.socketEvents++;
        console.log(`${colors.blue}[SOCKET] ${timestamp}${colors.reset}`);
        console.log(`  ${line.trim()}`);
        console.log('');
    }
}

// Monitor backend process
async function monitorBackend() {
    console.log(`${colors.cyan}Starting Backend Log Monitor...${colors.reset}\n`);
    
    try {
        // Get the PID of the backend process
        const { stdout: pidOutput } = await execPromise('ps aux | grep "node.*server.js" | grep -v grep | awk \'{print $2}\'');
        const pid = pidOutput.trim().split('\n')[0];
        
        if (!pid) {
            console.log(`${colors.red}Backend process not found!${colors.reset}`);
            return;
        }
        
        console.log(`${colors.green}Found backend process: PID ${pid}${colors.reset}\n`);
        
        // Use lsof to monitor file descriptors and network connections
        setInterval(async () => {
            try {
                const { stdout: connections } = await execPromise(`lsof -p ${pid} -i -n | grep -E "(LISTEN|ESTABLISHED)" | wc -l`);
                const { stdout: memory } = await execPromise(`ps -p ${pid} -o rss= | awk '{print $1/1024 " MB"}'`);
                
                console.log(`${colors.magenta}[STATS] ${new Date().toISOString()}${colors.reset}`);
                console.log(`  Connections: ${connections.trim()}`);
                console.log(`  Memory: ${memory.trim()}`);
                console.log(`  Errors: ${stats.errors}, Warnings: ${stats.warnings}`);
                console.log(`  API Calls: ${stats.apiCalls}, Socket Events: ${stats.socketEvents}`);
                console.log(`  Uptime: ${Math.floor((Date.now() - stats.startTime) / 1000)}s\n`);
            } catch (err) {
                // Ignore errors in stats collection
            }
        }, 10000); // Every 10 seconds
        
    } catch (error) {
        console.error(`${colors.red}Error monitoring backend:${colors.reset}`, error.message);
    }
}

// Monitor system logs
async function monitorSystemLogs() {
    console.log(`${colors.cyan}Monitoring system logs...${colors.reset}\n`);
    
    // Tail console logs
    const logProcess = exec('tail -f /tmp/*.log 2>/dev/null || echo "No logs found"');
    
    logProcess.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
            if (line.trim()) {
                analyzeLine(line);
            }
        });
    });
    
    logProcess.stderr.on('data', (data) => {
        console.error(`${colors.red}Log error:${colors.reset}`, data.toString());
    });
}

// Check API endpoints
async function checkAPIEndpoints() {
    console.log(`${colors.cyan}Checking API endpoints...${colors.reset}\n`);
    
    const endpoints = [
        'http://localhost:5001/api/health',
        'http://localhost:5001/api/forums',
        'http://localhost:5001/api/chat/rooms'
    ];
    
    for (const endpoint of endpoints) {
        try {
            const start = Date.now();
            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': 'Bearer test-token'
                }
            });
            const time = Date.now() - start;
            
            if (response.ok) {
                console.log(`${colors.green}✓ ${endpoint} - ${response.status} (${time}ms)${colors.reset}`);
            } else {
                console.log(`${colors.red}✗ ${endpoint} - ${response.status} (${time}ms)${colors.reset}`);
            }
        } catch (error) {
            console.log(`${colors.red}✗ ${endpoint} - ${error.message}${colors.reset}`);
        }
    }
    console.log('');
}

// Main monitoring function
async function startMonitoring() {
    console.clear();
    console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.cyan}   Erasmus Project - Real-time Log Monitor${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
    
    // Initial API check
    await checkAPIEndpoints();
    
    // Start monitoring
    await monitorBackend();
    await monitorSystemLogs();
    
    // Periodic API checks
    setInterval(checkAPIEndpoints, 30000);
    
    // Handle exit
    process.on('SIGINT', () => {
        console.log(`\n${colors.cyan}Monitoring stopped.${colors.reset}`);
        console.log(`${colors.cyan}Final stats:${colors.reset}`);
        console.log(`  Total errors: ${stats.errors}`);
        console.log(`  Total warnings: ${stats.warnings}`);
        console.log(`  Total API calls: ${stats.apiCalls}`);
        console.log(`  Total socket events: ${stats.socketEvents}`);
        process.exit(0);
    });
}

// Start monitoring
startMonitoring();