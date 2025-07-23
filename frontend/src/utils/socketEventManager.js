import socketService from '../services/socketService';
import apiClient from '../services/api/client';
import { devLog } from './devLog';

/**
 * Socket Event Manager - Centralized handler for all socket events
 * Ensures proper event registration and cache invalidation
 */
class SocketEventManager {
    constructor() {
        this.eventHandlers = new Map();
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
    }

    /**
     * Register a handler for a socket event
     */
    registerHandler(event, handler) {
        // Store handler
        this.eventHandlers.set(event, handler);
        
        // Register with socket service
        socketService.on(event, handler);
        
        devLog('SocketEventManager', `Registered handler for event: ${event}`);
    }

    /**
     * Ensure all listeners are active (called after reconnection)
     */
    ensureAllListenersActive() {
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
        // This will be handled by individual screens
        // For now, just log
        devLog('SocketEventManager', `Emitting local event: ${event}`, data);
    }

    /**
     * Clean up all event listeners
     */
    cleanup() {
        this.eventHandlers.forEach((handler, event) => {
            socketService.off(event, handler);
        });
        this.eventHandlers.clear();
        this.isInitialized = false;
        devLog('SocketEventManager', 'Cleaned up all event listeners');
    }
}

// Create singleton instance
const socketEventManager = new SocketEventManager();

export default socketEventManager;