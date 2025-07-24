/**
 * Connection Test Utilities
 * Simple utilities for testing socket and HTTP connections
 */

import { API_BASE_URL } from '../config/network';
import { devLog, devError } from './devLog';

/**
 * Test HTTP connection to backend
 * @returns {Promise<boolean>} Connection success
 */
export async function testHttpConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (response.ok) {
            devLog('ConnectionTest', 'HTTP connection successful');
            return true;
        } else {
            devError('ConnectionTest', `HTTP connection failed: ${response.status}`);
            return false;
        }
    } catch (error) {
        devError('ConnectionTest', 'HTTP connection error:', error);
        return false;
    }
}

/**
 * Test direct socket connection
 * @returns {Promise<void>}
 */
export async function testDirectSocketConnection() {
    try {
        devLog('ConnectionTest', 'Testing direct socket connection...');
        
        // Import socket.io-client dynamically
        const { io } = await import('socket.io-client');
        
        // Get socket URL
        let socketUrl = API_BASE_URL.replace('/api', '');
        
        devLog('ConnectionTest', `Attempting connection to: ${socketUrl}`);
        
        // Create test socket
        const testSocket = io(socketUrl, {
            transports: ['polling', 'websocket'],
            autoConnect: true,
            reconnection: false,
            timeout: 5000,
        });
        
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                devLog('ConnectionTest', 'Direct socket test timed out');
                testSocket.disconnect();
                resolve();
            }, 5000);
            
            testSocket.on('connect', () => {
                clearTimeout(timeout);
                devLog('ConnectionTest', '✅ Direct socket connected successfully');
                devLog('ConnectionTest', `Socket ID: ${testSocket.id}`);
                testSocket.disconnect();
                resolve();
            });
            
            testSocket.on('connect_error', (error) => {
                clearTimeout(timeout);
                devError('ConnectionTest', '❌ Direct socket connection failed:', error.message);
                testSocket.disconnect();
                resolve();
            });
        });
    } catch (error) {
        devError('ConnectionTest', 'Direct socket test error:', error);
    }
}