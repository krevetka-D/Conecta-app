/**
 * Socket Connection Manager
 * Ensures socket connection is established and maintained
 */

import realtimeService from '../services/realtimeService';
import socketService from '../services/socketService';

import { devLog, devError } from './devLog';

class SocketConnectionManager {
    constructor() {
        this.connectionCheckInterval = null;
        this.connectionAttempts = 0;
        this.maxAttempts = 5;
        this.isMonitoring = false;
    }

    /**
     * Start monitoring socket connection
     */
    async startMonitoring(userId) {
        if (this.isMonitoring) {
            devLog('SocketConnectionManager', 'Already monitoring connection');
            return;
        }

        this.isMonitoring = true;
        this.userId = userId;
        this.connectionAttempts = 0; // Reset on start
        
        // Use hybrid realtime service
        const mode = await realtimeService.initialize(userId);
        devLog('SocketConnectionManager', `Initialized with mode: ${mode}`);
        
        // Only monitor WebSocket if that's the mode
        if (mode === 'websocket') {
            // Check connection every 10 seconds
            this.connectionCheckInterval = setInterval(() => {
                // Reset attempts counter every minute (6 intervals)
                if (this.connectionAttempts >= this.maxAttempts) {
                    devLog('SocketConnectionManager', 'Resetting connection attempts for new cycle');
                    this.connectionAttempts = 0;
                }
                this.ensureConnection();
            }, 10000);
        }
        
        devLog('SocketConnectionManager', `Started monitoring (mode: ${mode})`);
    }

    /**
     * Stop monitoring socket connection
     */
    stopMonitoring() {
        if (this.connectionCheckInterval) {
            clearInterval(this.connectionCheckInterval);
            this.connectionCheckInterval = null;
        }
        this.isMonitoring = false;
        this.connectionAttempts = 0;
        devLog('SocketConnectionManager', 'Stopped monitoring socket connection');
    }

    /**
     * Ensure socket is connected
     */
    async ensureConnection() {
        try {
            // Check if already connected
            if (socketService.isConnected()) {
                this.connectionAttempts = 0; // Reset attempts on successful connection
                return true;
            }

            // Don't retry if max attempts reached in this cycle
            if (this.connectionAttempts >= this.maxAttempts) {
                devLog('SocketConnectionManager', `Max connection attempts (${this.maxAttempts}) reached for this cycle`);
                return false;
            }

            // Attempt connection
            if (this.userId) {
                devLog('SocketConnectionManager', `Attempting to connect socket (attempt ${this.connectionAttempts + 1}/${this.maxAttempts})`);
                this.connectionAttempts++;
                
                await socketService.connect(this.userId);
                
                // Wait a bit for connection to establish
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Check if connection was successful
                if (socketService.isConnected()) {
                    devLog('SocketConnectionManager', 'Socket connection established successfully');
                    this.connectionAttempts = 0;
                    return true;
                } else {
                    const state = socketService.getConnectionState();
                    const socketId = socketService.getSocketId();
                    devLog('SocketConnectionManager', 'Socket connection attempt completed but not connected', {
                        state,
                        socketId,
                        isAuthenticated: socketService.isAuthenticated,
                        socket: !!socketService.socket,
                        connected: socketService.socket?.connected,
                    });
                    return false;
                }
            }
        } catch (error) {
            devError('SocketConnectionManager', 'Error ensuring socket connection', error);
            return false;
        }
    }

    /**
     * Force reconnect
     */
    async forceReconnect() {
        devLog('SocketConnectionManager', 'Forcing socket reconnection');
        socketService.disconnect();
        this.connectionAttempts = 0;
        
        if (this.userId) {
            await this.ensureConnection();
        }
    }

    /**
     * Get connection status
     */
    getStatus() {
        const realtimeStatus = realtimeService.getStatus();
        return {
            mode: realtimeStatus.mode,
            isConnected: realtimeStatus.connected,
            isAuthenticated: socketService.isAuthenticated,
            connectionState: socketService.getConnectionState(),
            socketId: socketService.getSocketId(),
            attempts: this.connectionAttempts,
            isMonitoring: this.isMonitoring,
            realtimeDetails: realtimeStatus.details,
        };
    }
}

// Create singleton instance
const socketConnectionManager = new SocketConnectionManager();

export default socketConnectionManager;