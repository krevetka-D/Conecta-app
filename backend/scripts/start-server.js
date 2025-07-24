#!/usr/bin/env node

import { spawn } from 'child_process';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const PORT = process.env.PORT || '5001';
let retryCount = 0;
const MAX_RETRIES = 3;

async function checkPort(port) {
    try {
        const { stdout } = await execAsync(`lsof -i :${port} | grep LISTEN`);
        return stdout.length > 0;
    } catch (error) {
        return false;
    }
}

async function killPort(port) {
    try {
        console.log(`🔍 Checking for processes on port ${port}...`);
        const { stdout } = await execAsync(`lsof -i :${port} | grep LISTEN`);
        
        if (stdout) {
            const pidMatch = stdout.match(/\w+\s+(\d+)/);
            if (pidMatch && pidMatch[1]) {
                const pid = pidMatch[1];
                console.log(`💀 Killing process ${pid} on port ${port}...`);
                await execAsync(`kill -9 ${pid}`);
                console.log(`✅ Process killed successfully`);
                
                // Wait a bit for port to be freed
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    } catch (error) {
        // Port is free
    }
}

async function startServer() {
    const isPortInUse = await checkPort(PORT);
    
    if (isPortInUse) {
        console.log(`⚠️  Port ${PORT} is in use`);
        
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`🔄 Attempt ${retryCount}/${MAX_RETRIES}: Killing existing process...`);
            await killPort(PORT);
            return startServer();
        } else {
            console.error(`❌ Failed to free port ${PORT} after ${MAX_RETRIES} attempts`);
            process.exit(1);
        }
    }
    
    console.log(`🚀 Starting server on port ${PORT}...`);
    
    const server = spawn('node', ['server.js'], {
        cwd: process.cwd(),
        stdio: 'inherit',
        env: { ...process.env }
    });
    
    server.on('error', (error) => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });
    
    server.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Server exited with code ${code}`);
            
            if (code === 1 && retryCount < MAX_RETRIES) {
                retryCount++;
                console.log(`🔄 Retrying... (${retryCount}/${MAX_RETRIES})`);
                setTimeout(() => startServer(), 2000);
            } else {
                process.exit(code);
            }
        }
    });
    
    // Forward signals to server
    process.on('SIGTERM', () => server.kill('SIGTERM'));
    process.on('SIGINT', () => server.kill('SIGINT'));
}

startServer();