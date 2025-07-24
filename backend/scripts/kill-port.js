#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const PORT = process.argv[2] || '5001';

async function killPort(port) {
    try {
        console.log(`🔍 Checking for processes on port ${port}...`);
        
        // Check what's using the port
        const { stdout } = await execAsync(`lsof -i :${port} | grep LISTEN`);
        
        if (stdout) {
            console.log(`📍 Found process using port ${port}:`);
            console.log(stdout);
            
            // Extract PID from lsof output
            const pidMatch = stdout.match(/\w+\s+(\d+)/);
            if (pidMatch && pidMatch[1]) {
                const pid = pidMatch[1];
                console.log(`💀 Killing process ${pid}...`);
                
                await execAsync(`kill -9 ${pid}`);
                console.log(`✅ Process killed successfully`);
            }
        } else {
            console.log(`✨ Port ${port} is free`);
        }
    } catch (error) {
        if (error.code === 1) {
            console.log(`✨ Port ${port} is free`);
        } else {
            console.error(`❌ Error: ${error.message}`);
        }
    }
}

killPort(PORT);