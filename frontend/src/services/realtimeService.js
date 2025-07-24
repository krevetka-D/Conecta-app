/**
 * Realtime Service - Manages real-time updates using WebSocket or HTTP polling
 * Automatically falls back to polling if WebSocket fails
 */

import { devLog, devError } from '../utils';

import pollingService from './pollingService';
import socketService from './socketService';

class RealtimeService {
    constructor() {
        this.mode = 'none'; // 'websocket', 'polling', or 'none'
        this.listeners = new Map();
        this.connectionCheckInterval = null;
        this.userId = null;
    }

    /**
     * Initialize real-time connection
     */
    async initialize(userId) {
        this.userId = userId;
        devLog('RealtimeService', 'Initializing real-time connection', { userId });

        // Try WebSocket first
        const socketConnected = await this.tryWebSocket(userId);
        
        if (socketConnected) {
            this.mode = 'websocket';
            devLog('RealtimeService', '✅ Using WebSocket for real-time updates');
        } else {
            // Fall back to polling
            this.mode = 'polling';
            pollingService.start();
            this.setupPollingListeners();
            devLog('RealtimeService', '📊 Using HTTP polling for updates (WebSocket unavailable)');
        }

        // Monitor connection and switch modes if needed
        this.startConnectionMonitoring();
        
        return this.mode;
    }

    /**
     * Try to establish WebSocket connection
     */
    async tryWebSocket(userId) {
        try {
            // Give socket 5 seconds to connect
            await socketService.connect(userId);
            
            // Wait a bit for connection to establish
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            return socketService.isConnected();
        } catch (error) {
            devError('RealtimeService', 'WebSocket connection failed:', error);
            return false;
        }
    }

    /**
     * Setup polling listeners that mimic socket events
     */
    setupPollingListeners() {
        // Map polling events to socket-like events
        pollingService.on('new_message', (data) => {
            this.emitLocal('new_message', data);
        });

        pollingService.on('forum_update', (data) => {
            this.emitLocal('forum_update', data);
        });

        pollingService.on('user_status_update', (data) => {
            this.emitLocal('user_status_update', data);
        });

        pollingService.on('notification', (data) => {
            this.emitLocal('notification', data);
        });
    }

    /**
     * Monitor connection and switch between modes as needed
     */
    startConnectionMonitoring() {
        this.connectionCheckInterval = setInterval(async () => {
            if (this.mode === 'polling' && this.userId) {
                // Try to upgrade to WebSocket
                const socketConnected = await this.tryWebSocket(this.userId);
                if (socketConnected) {
                    devLog('RealtimeService', '🔄 Upgrading from polling to WebSocket');
                    pollingService.stop();
                    this.mode = 'websocket';
                }
            } else if (this.mode === 'websocket' && !socketService.isConnected()) {
                // Downgrade to polling if WebSocket lost
                devLog('RealtimeService', '🔄 Downgrading from WebSocket to polling');
                this.mode = 'polling';
                pollingService.start();
                this.setupPollingListeners();
            }
        }, 30000); // Check every 30 seconds
    }

    /**
     * Stop connection monitoring
     */
    stopConnectionMonitoring() {
        if (this.connectionCheckInterval) {
            clearInterval(this.connectionCheckInterval);
            this.connectionCheckInterval = null;
        }
    }

    /**
     * Register event listener (works for both WebSocket and polling)
     */
    on(event, callback) {
        // Store listener
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);

        // Register with appropriate service
        if (this.mode === 'websocket') {
            socketService.on(event, callback);
        }
        // Polling listeners are already set up in setupPollingListeners

        // Return unsubscribe function
        return () => {
            const eventListeners = this.listeners.get(event);
            if (eventListeners) {
                eventListeners.delete(callback);
            }
            if (this.mode === 'websocket') {
                socketService.off(event, callback);
            }
        };
    }

    /**
     * Remove event listener
     */
    off(event, callback) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.delete(callback);
        }
        if (this.mode === 'websocket') {
            socketService.off(event, callback);
        }
    }

    /**
     * Emit event to all local listeners
     */
    emitLocal(event, data) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    devError('RealtimeService', `Error in ${event} listener:`, error);
                }
            });
        }
    }

    /**
     * Send data to server (only works with WebSocket)
     */
    emit(event, data) {
        if (this.mode === 'websocket') {
            socketService.emit(event, data);
        } else {
            devLog('RealtimeService', 'Cannot emit in polling mode, using API instead');
            // In polling mode, updates should go through normal API calls
        }
    }

    /**
     * Join a room (WebSocket only)
     */
    joinRoom(roomId) {
        if (this.mode === 'websocket') {
            socketService.joinRoom(roomId);
        }
        // In polling mode, room filtering happens server-side
    }

    /**
     * Leave a room (WebSocket only)
     */
    leaveRoom(roomId) {
        if (this.mode === 'websocket') {
            socketService.leaveRoom(roomId);
        }
    }

    /**
     * Get current connection status
     */
    getStatus() {
        return {
            mode: this.mode,
            connected: this.mode !== 'none',
            details: this.mode === 'websocket' 
                ? {
                    socketConnected: socketService.isConnected(),
                    socketId: socketService.getSocketId(),
                }
                : {
                    pollingActive: pollingService.isPollingActive(),
                    pollingStatus: pollingService.getStatus(),
                },
        };
    }

    /**
     * Disconnect and cleanup
     */
    disconnect() {
        this.stopConnectionMonitoring();
        
        if (this.mode === 'websocket') {
            socketService.disconnect();
        } else if (this.mode === 'polling') {
            pollingService.stop();
        }
        
        this.mode = 'none';
        this.listeners.clear();
        this.userId = null;
    }
}

// Create singleton instance
const realtimeService = new RealtimeService();

// Export for debugging
if (__DEV__) {
    global.realtimeService = realtimeService;
}

export default realtimeService;