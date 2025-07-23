/**
 * Real-time Updates Debugger
 * Helps diagnose real-time update issues
 */

import socketService from '../services/socketService';
import { devLog } from './devLog';

class RealtimeDebugger {
    constructor() {
        this.events = [];
        this.maxEvents = 100;
        this.listeners = new Map();
        this.isEnabled = __DEV__;
    }

    /**
     * Start debugging real-time events
     */
    start() {
        if (!this.isEnabled) return;

        devLog('RealtimeDebugger', '🔍 Starting real-time debugging...');

        // Common events to monitor
        const eventsToMonitor = [
            'connect',
            'disconnect',
            'authenticated',
            'auth_error',
            'budget_update',
            'checklist_update',
            'event_update',
            'forum_update',
            'new_message',
            'room_update',
            'user_status_update',
            'error',
            'reconnect',
            'reconnect_attempt',
            'reconnect_error',
            'reconnect_failed'
        ];

        eventsToMonitor.forEach(event => {
            this.addListener(event);
        });

        // Log connection state
        this.logConnectionState();
    }

    /**
     * Add listener for an event
     */
    addListener(event) {
        if (this.listeners.has(event)) return;

        const handler = (data) => {
            this.logEvent(event, data);
        };

        socketService.on(event, handler);
        this.listeners.set(event, handler);
    }

    /**
     * Log an event
     */
    logEvent(event, data) {
        const timestamp = new Date().toISOString();
        const eventLog = {
            timestamp,
            event,
            data: this.sanitizeData(data),
            socketId: socketService.getSocketId(),
            isConnected: socketService.isConnected()
        };

        this.events.push(eventLog);

        // Keep only last N events
        if (this.events.length > this.maxEvents) {
            this.events.shift();
        }

        // Log to console with color coding
        const color = this.getEventColor(event);
        console.log(
            `%c[RT-${event}] ${timestamp}`,
            `color: ${color}; font-weight: bold`,
            data
        );

        // Special handling for specific events
        this.handleSpecialEvents(event, data);
    }

    /**
     * Sanitize data for logging (remove sensitive info)
     */
    sanitizeData(data) {
        if (!data) return data;
        
        const sanitized = { ...data };
        
        // Remove sensitive fields
        const sensitiveFields = ['token', 'password', 'auth'];
        sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        });

        return sanitized;
    }

    /**
     * Get color for event type
     */
    getEventColor(event) {
        const colorMap = {
            'connect': 'green',
            'disconnect': 'red',
            'authenticated': 'blue',
            'auth_error': 'red',
            'error': 'red',
            'reconnect': 'orange',
            'reconnect_attempt': 'orange',
            'reconnect_error': 'red',
            'reconnect_failed': 'red',
            'new_message': 'purple',
            'budget_update': 'teal',
            'checklist_update': 'teal',
            'event_update': 'teal',
            'forum_update': 'teal'
        };

        return colorMap[event] || 'gray';
    }

    /**
     * Handle special events that need additional logging
     */
    handleSpecialEvents(event, data) {
        switch (event) {
            case 'connect':
                devLog('RealtimeDebugger', '✅ Socket connected', {
                    socketId: socketService.getSocketId(),
                    transport: socketService.socket?.io?.engine?.transport?.name
                });
                break;

            case 'disconnect':
                devLog('RealtimeDebugger', '❌ Socket disconnected', {
                    reason: data
                });
                break;

            case 'authenticated':
                devLog('RealtimeDebugger', '🔐 Socket authenticated', {
                    userId: data?.userId
                });
                break;

            case 'error':
                devLog('RealtimeDebugger', '⚠️ Socket error', data);
                break;

            case 'new_message':
                devLog('RealtimeDebugger', '💬 New message received', {
                    roomId: data?.roomId,
                    sender: data?.sender?.name,
                    messageCount: data?.messages?.length || 1
                });
                break;
        }
    }

    /**
     * Log current connection state
     */
    logConnectionState() {
        const state = {
            isConnected: socketService.isConnected(),
            socketId: socketService.getSocketId(),
            connectionState: socketService.getConnectionState(),
            transport: socketService.socket?.io?.engine?.transport?.name,
            readyState: socketService.socket?.connected
        };

        devLog('RealtimeDebugger', '📊 Connection State', state);
        return state;
    }

    /**
     * Get event history
     */
    getEventHistory() {
        return this.events;
    }

    /**
     * Get event statistics
     */
    getEventStats() {
        const stats = {};
        
        this.events.forEach(event => {
            if (!stats[event.event]) {
                stats[event.event] = {
                    count: 0,
                    lastOccurred: null
                };
            }
            
            stats[event.event].count++;
            stats[event.event].lastOccurred = event.timestamp;
        });

        return stats;
    }

    /**
     * Clear event history
     */
    clearHistory() {
        this.events = [];
        devLog('RealtimeDebugger', '🧹 Event history cleared');
    }

    /**
     * Stop debugging
     */
    stop() {
        devLog('RealtimeDebugger', '🛑 Stopping real-time debugging...');
        
        // Remove all listeners
        this.listeners.forEach((handler, event) => {
            socketService.off(event, handler);
        });
        
        this.listeners.clear();
        this.clearHistory();
    }

    /**
     * Export debug data
     */
    exportDebugData() {
        return {
            timestamp: new Date().toISOString(),
            connectionState: this.logConnectionState(),
            eventHistory: this.getEventHistory(),
            eventStats: this.getEventStats(),
            socketInfo: {
                id: socketService.getSocketId(),
                connected: socketService.isConnected(),
                authenticated: socketService.isAuthenticated
            }
        };
    }
}

// Create singleton instance
const realtimeDebugger = new RealtimeDebugger();

// Auto-start in development
if (__DEV__) {
    // Wait for socket to be available
    setTimeout(() => {
        if (socketService) {
            realtimeDebugger.start();
        }
    }, 1000);
}

// Export for global access in development
if (__DEV__) {
    global.rtDebugger = realtimeDebugger;
}

export default realtimeDebugger;