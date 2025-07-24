import apiClient from '../services/api/client';
import socketService from '../services/socketService';

import { devLog, devError } from './devLog';

/**
 * Socket Event Manager - Centralized handler for all socket events
 * Ensures proper event registration and cache invalidation
 */
class SocketEventManager {
    constructor() {
        this.eventHandlers = new Map();
        this.localListeners = new Map(); // Store local listeners
        this.isInitialized = false;
    }

    /**
     * Initialize socket event listeners
     * Should be called after socket authentication
     */
    initialize() {
        if (this.isInitialized) {
            devLog('SocketEventManager', 'Already initialized');
            return;
        }

        // Register all event handlers
        this.registerEventHandlers();
        
        // Set up authentication listener to re-register events
        socketService.on('authenticated', () => {
            devLog('SocketEventManager', 'Socket authenticated, ensuring all listeners are active');
            this.ensureAllListenersActive();
        });

        this.isInitialized = true;
        devLog('SocketEventManager', 'Initialized successfully');
    }

    /**
     * Register all event handlers
     */
    registerEventHandlers() {
        // Budget events
        this.registerHandler('budget_update', (data) => {
            devLog('SocketEvent', 'Budget update received:', data);
            // Clear cache
            apiClient.clearCache('/budget');
            apiClient.clearCache('/budget/summary');
            // Emit for screens to handle
            this.emit('budget_update', data);
        });

        // Checklist events
        this.registerHandler('checklist_update', (data) => {
            devLog('SocketEvent', 'Checklist update received:', data);
            // Clear cache
            apiClient.clearCache('/checklist');
            // Emit for screens to handle
            this.emit('checklist_update', data);
        });

        // Event events
        this.registerHandler('event_update', (data) => {
            devLog('SocketEvent', 'Event update received:', data);
            // Clear cache
            apiClient.clearCache('/events');
            if (data.event?._id) {
                apiClient.clearCache(`/events/${data.event._id}`);
            }
            // Emit for screens to handle
            this.emit('event_update', data);
        });

        // Forum events
        this.registerHandler('forum_update', (data) => {
            devLog('SocketEvent', 'Forum update received:', data);
            // Clear cache
            apiClient.clearCache('/forums');
            if (data.forum?._id) {
                apiClient.clearCache(`/forums/${data.forum._id}`);
            }
            // Emit for screens to handle
            this.emit('forum_update', data);
        });

        // Message events
        this.registerHandler('new_message', (data) => {
            devLog('SocketEvent', 'New message received:', data);
            // Clear cache
            apiClient.clearCache('/messages');
            apiClient.clearCache('/messages/conversations');
            apiClient.clearCache('/forums');
            if (data.roomId) {
                apiClient.clearCache(`/chat/rooms/${data.roomId}/messages`);
            }
            // Emit for screens to handle
            this.emit('new_message', data);
        });

        // Dashboard events
        this.registerHandler('dashboard_update', (data) => {
            devLog('SocketEvent', 'Dashboard update received:', data);
            // Clear relevant caches
            apiClient.clearCache('/dashboard');
            apiClient.clearCache('/dashboard/stats');
            // Emit for screens to handle
            this.emit('dashboard_update', data);
        });

        // Connection state changes
        this.registerHandler('connection_state_change', (state) => {
            devLog('SocketEvent', 'Connection state changed:', state);
            if (state === 'connected') {
                // Clear all caches on reconnection
                apiClient.clearAllCache();
            }
            this.emit('connection_state_change', state);
        });

        // User status events
        this.registerHandler('user_status_update', (data) => {
            devLog('SocketEvent', 'User status update:', data);
            this.emit('user_status_update', data);
        });
        
        // Cache invalidation events
        this.registerHandler('cache_invalidated', (data) => {
            devLog('SocketEvent', 'Cache invalidation received:', data);
            if (data.all) {
                apiClient.clearAllCache();
            } else if (data.endpoints) {
                data.endpoints.forEach(endpoint => {
                    apiClient.clearCache(endpoint);
                });
            }
        });
    }

    /**
     * Register a handler for a socket event
     */
    registerHandler(event, handler) {
        // Store handler
        this.eventHandlers.set(event, handler);
        
        // Register with socket service only if connected
        if (socketService.isConnected()) {
            socketService.on(event, handler);
            devLog('SocketEventManager', `Registered handler for event: ${event}`);
        } else {
            devLog('SocketEventManager', `Deferred registration for event: ${event} (socket not connected)`);
        }
    }

    /**
     * Ensure all listeners are active (called after reconnection)
     */
    ensureAllListenersActive() {
        if (!socketService.isConnected()) {
            devLog('SocketEventManager', 'Socket not connected, skipping listener activation');
            return;
        }
        
        devLog('SocketEventManager', 'Ensuring all listeners are active...');
        this.eventHandlers.forEach((handler, event) => {
            // Re-register handler
            socketService.off(event, handler);
            socketService.on(event, handler);
            devLog('SocketEventManager', `Re-registered handler for event: ${event}`);
        });
    }

    /**
     * Emit event to local listeners (screens)
     */
    emit(event, data) {
        devLog('SocketEventManager', `Emitting local event: ${event}`, data);
        
        // Get all listeners for this event
        const listeners = this.localListeners.get(event) || [];
        
        // Call each listener
        listeners.forEach(listener => {
            try {
                listener(data);
            } catch (error) {
                devError('SocketEventManager', `Error in listener for ${event}:`, error);
            }
        });
    }
    
    /**
     * Register a local listener for events
     */
    on(event, callback) {
        if (!this.localListeners.has(event)) {
            this.localListeners.set(event, []);
        }
        this.localListeners.get(event).push(callback);
        
        // Return unsubscribe function
        return () => {
            const listeners = this.localListeners.get(event);
            if (listeners) {
                const index = listeners.indexOf(callback);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        };
    }
    
    /**
     * Remove all listeners for an event
     */
    off(event, callback = null) {
        if (callback) {
            const listeners = this.localListeners.get(event);
            if (listeners) {
                const index = listeners.indexOf(callback);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        } else {
            this.localListeners.delete(event);
        }
    }

    /**
     * Clean up all event listeners
     */
    cleanup() {
        this.eventHandlers.forEach((handler, event) => {
            socketService.off(event, handler);
        });
        this.eventHandlers.clear();
        this.localListeners.clear();
        this.isInitialized = false;
        devLog('SocketEventManager', 'Cleaned up all event listeners');
    }
}

// Create singleton instance
const socketEventManager = new SocketEventManager();

export default socketEventManager;