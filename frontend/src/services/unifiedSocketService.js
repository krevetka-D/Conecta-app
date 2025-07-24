/**
 * Unified Socket Service
 * Combines all socket functionality into a single, comprehensive service
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import io from 'socket.io-client';
import { API_BASE_URL } from '../config/network';
import apiClient from './api/client';
import { devLog, devError } from '../utils';

class UnifiedSocketService {
    constructor() {
        // Core socket properties
        this.socket = null;
        this.isAuthenticated = false;
        this.userId = null;
        this.connectionState = 'disconnected';
        
        // Event management
        this.eventHandlers = new Map();
        this.localListeners = new Map();
        this.roomStates = new Map();
        
        // Connection management
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.connectionTimeout = 30000;
        
        // Debug mode
        this.debugMode = __DEV__;
    }

    // =====================================================
    // Core Connection Methods
    // =====================================================

    /**
     * Connect to socket server
     * @param {string} userId - User ID for authentication
     * @returns {Promise} Resolves when connected and authenticated
     */
    async connect(userId) {
        if (this.socket?.connected && this.isAuthenticated && this.userId === userId) {
            devLog('UnifiedSocket', 'Already connected and authenticated');
            return Promise.resolve(true);
        }

        this.userId = userId;

        try {
            const token = await AsyncStorage.getItem('userToken');
            
            // Get socket URL and handle platform-specific issues
            let socketUrl = API_BASE_URL.replace('/api', '');
            if (socketUrl.includes('localhost')) {
                if (Platform.OS === 'android') {
                    socketUrl = socketUrl.replace('localhost', '10.0.2.2');
                } else if (Platform.OS === 'ios') {
                    socketUrl = socketUrl.replace('localhost', '127.0.0.1');
                }
            }

            devLog('UnifiedSocket', `Connecting to: ${socketUrl}`);

            // Disconnect existing socket if any
            if (this.socket) {
                this.disconnect();
            }

            // Create socket with optimized options
            this.socket = io(socketUrl, {
                transports: ['polling', 'websocket'],
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: this.reconnectDelay,
                reconnectionDelayMax: 5000,
                timeout: this.connectionTimeout,
                auth: {
                    token: token || '',
                },
                query: {
                    userId: userId,
                    platform: Platform.OS,
                },
                forceNew: true,
                multiplex: false,
                upgrade: true,
                rememberUpgrade: true,
                path: '/socket.io/',
                withCredentials: false,
            });

            // Setup event handlers
            this.setupCoreEventHandlers();

            // Return promise that resolves on authentication
            return new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    devLog('UnifiedSocket', 'Connection timeout, resolving anyway');
                    resolve(false);
                }, this.connectionTimeout);

                // Success handlers
                const authHandler = (data) => {
                    clearTimeout(timeout);
                    devLog('UnifiedSocket', 'Authenticated successfully', data);
                    this.isAuthenticated = true;
                    this.connectionState = 'authenticated';
                    this.reconnectAttempts = 0;
                    
                    // Re-register all event handlers
                    this.reregisterAllHandlers();
                    
                    // Rejoin all rooms
                    this.rejoinAllRooms();
                    
                    resolve(true);
                };

                const connectHandler = () => {
                    devLog('UnifiedSocket', 'Connected successfully');
                    this.connectionState = 'connected';
                    
                    // Emit authentication
                    if (userId) {
                        devLog('UnifiedSocket', `Emitting authenticate with userId: ${userId}`);
                        this.socket.emit('authenticate', { userId });
                    } else {
                        clearTimeout(timeout);
                        resolve(false);
                    }
                };

                // Error handlers
                const errorHandler = (error) => {
                    clearTimeout(timeout);
                    devError('UnifiedSocket', 'Connection error:', error);
                    this.connectionState = 'error';
                    resolve(false);
                };

                // Register handlers
                this.socket.once('authenticated', authHandler);
                this.socket.once('connect', connectHandler);
                this.socket.once('connect_error', errorHandler);
                this.socket.once('auth_error', errorHandler);
            });
        } catch (error) {
            devError('UnifiedSocket', 'Connection setup failed:', error);
            return Promise.resolve(false);
        }
    }

    /**
     * Disconnect from socket server
     */
    disconnect() {
        if (this.socket) {
            // Leave all rooms
            this.roomStates.forEach((_, roomId) => {
                this.leaveRoom(roomId);
            });
            
            // Remove all listeners
            this.socket.removeAllListeners();
            
            // Disconnect socket
            this.socket.disconnect();
            this.socket = null;
        }

        // Reset state
        this.eventHandlers.clear();
        this.localListeners.clear();
        this.roomStates.clear();
        this.isAuthenticated = false;
        this.connectionState = 'disconnected';
        this.reconnectAttempts = 0;
        
        devLog('UnifiedSocket', 'Disconnected');
    }

    /**
     * Force reconnect
     * @returns {Promise} Resolves when reconnected
     */
    async forceReconnect() {
        devLog('UnifiedSocket', 'Force reconnecting...');
        
        this.disconnect();
        
        // Wait before reconnecting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (this.userId) {
            return this.connect(this.userId);
        }
        
        return Promise.resolve(false);
    }

    // =====================================================
    // Event Management
    // =====================================================

    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {any} data - Event data
     */
    emit(event, data) {
        if (this.socket?.connected) {
            this.socket.emit(event, data);
            if (this.debugMode) {
                devLog('UnifiedSocket', `Emitted ${event}`, data);
            }
        } else {
            devError('UnifiedSocket', `Cannot emit ${event}, not connected`);
        }
    }

    /**
     * Listen for an event
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     */
    on(event, callback) {
        if (!this.socket) {
            devError('UnifiedSocket', 'Socket not initialized');
            return;
        }

        this.socket.on(event, callback);
        
        // Track handlers for re-registration
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event).add(callback);
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     */
    off(event, callback) {
        if (!this.socket) return;
        
        this.socket.off(event, callback);
        
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).delete(callback);
            if (this.eventHandlers.get(event).size === 0) {
                this.eventHandlers.delete(event);
            }
        }
    }

    /**
     * Listen for an event once
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     */
    once(event, callback) {
        if (this.socket) {
            this.socket.once(event, callback);
        }
    }

    /**
     * Add local event listener (for non-socket events)
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     */
    addLocalListener(event, callback) {
        if (!this.localListeners.has(event)) {
            this.localListeners.set(event, new Set());
        }
        this.localListeners.get(event).add(callback);
    }

    /**
     * Remove local event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     */
    removeLocalListener(event, callback) {
        if (this.localListeners.has(event)) {
            this.localListeners.get(event).delete(callback);
        }
    }

    /**
     * Emit local event
     * @param {string} event - Event name
     * @param {any} data - Event data
     */
    emitLocal(event, data) {
        if (this.localListeners.has(event)) {
            this.localListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    devError('UnifiedSocket', `Error in local listener for ${event}`, error);
                }
            });
        }
    }

    // =====================================================
    // Room Management
    // =====================================================

    /**
     * Join a room
     * @param {string} roomId - Room ID
     */
    joinRoom(roomId) {
        if (!roomId) {
            devError('UnifiedSocket', 'No room ID provided');
            return;
        }

        this.emit('joinRoom', roomId);
        
        // Track room state
        this.roomStates.set(roomId, {
            joined: true,
            joinedAt: new Date(),
            confirmed: false
        });
        
        devLog('UnifiedSocket', `Joining room: ${roomId}`);
    }

    /**
     * Leave a room
     * @param {string} roomId - Room ID
     */
    leaveRoom(roomId) {
        if (!roomId) return;
        
        this.emit('leaveRoom', roomId);
        this.roomStates.delete(roomId);
        
        devLog('UnifiedSocket', `Left room: ${roomId}`);
    }

    /**
     * Check if in a room
     * @param {string} roomId - Room ID
     * @returns {boolean} Is in room
     */
    isInRoom(roomId) {
        return this.roomStates.has(roomId);
    }

    /**
     * Get all joined rooms
     * @returns {Array} Room IDs
     */
    getJoinedRooms() {
        return Array.from(this.roomStates.keys());
    }

    // =====================================================
    // Chat Functionality
    // =====================================================

    /**
     * Send a message
     * @param {Object} data - Message data
     */
    sendMessage(data) {
        this.emit('sendMessage', data);
    }

    /**
     * Send a personal message
     * @param {Object} data - Message data
     */
    sendPersonalMessage(data) {
        this.emit('sendPersonalMessage', data);
    }

    /**
     * Send typing indicator
     * @param {string} roomId - Room ID (optional for personal chats)
     * @param {boolean} isTyping - Is typing
     * @param {string} recipientId - Recipient ID (for personal chats)
     */
    typing(roomId, isTyping, recipientId = null) {
        this.emit('typing', { roomId, isTyping, recipientId });
    }

    // =====================================================
    // Event Handlers
    // =====================================================

    /**
     * Setup core event handlers
     */
    setupCoreEventHandlers() {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            devLog('UnifiedSocket', 'Connected');
            this.connectionState = 'connected';
            this.emitLocal('connection_state_change', 'connected');
            
            // Clear all caches on reconnection
            apiClient.clearAllCache();
        });

        this.socket.on('disconnect', (reason) => {
            devLog('UnifiedSocket', `Disconnected: ${reason}`);
            this.connectionState = 'disconnected';
            this.isAuthenticated = false;
            this.emitLocal('connection_state_change', 'disconnected');
            
            // Attempt reconnection if not manual disconnect
            if (reason === 'io server disconnect' || reason === 'transport close') {
                this.attemptReconnect();
            }
        });

        this.socket.on('authenticated', (data) => {
            devLog('UnifiedSocket', 'Authenticated', data);
            this.isAuthenticated = true;
            this.emitLocal('authenticated', data);
        });

        this.socket.on('auth_error', (error) => {
            devError('UnifiedSocket', 'Authentication error:', error);
            this.isAuthenticated = false;
            this.emitLocal('auth_error', error);
        });

        this.socket.on('error', (error) => {
            devError('UnifiedSocket', 'Socket error:', error);
            this.emitLocal('socket_error', error);
        });

        // Room events
        this.socket.on('room_joined', (data) => {
            devLog('UnifiedSocket', 'Room joined:', data);
            if (this.roomStates.has(data.roomId)) {
                this.roomStates.set(data.roomId, {
                    ...this.roomStates.get(data.roomId),
                    confirmed: true,
                    memberCount: data.memberCount
                });
            }
            this.emitLocal('room_joined', data);
        });

        this.socket.on('room_join_error', (error) => {
            devError('UnifiedSocket', 'Room join error:', error);
            this.roomStates.delete(error.roomId);
            this.emitLocal('room_join_error', error);
        });

        // Cache invalidation
        this.socket.on('cache_invalidated', (data) => {
            devLog('UnifiedSocket', 'Cache invalidation:', data);
            if (data.all) {
                apiClient.clearAllCache();
            } else if (data.endpoints) {
                data.endpoints.forEach(endpoint => {
                    apiClient.clearCache(endpoint);
                });
            }
        });

        // Debug mode
        if (this.debugMode) {
            this.socket.onAny((eventName, ...args) => {
                devLog('UnifiedSocket', `Event: ${eventName}`, args);
            });
        }
    }

    /**
     * Setup application event handlers
     * Call this after authentication to register all app-specific handlers
     */
    setupAppEventHandlers() {
        // Budget events
        this.on('budget_update', (data) => {
            apiClient.clearCache('/budget');
            apiClient.clearCache('/budget/summary');
            this.emitLocal('budget_update', data);
        });

        // Checklist events
        this.on('checklist_update', (data) => {
            apiClient.clearCache('/checklist');
            this.emitLocal('checklist_update', data);
        });

        // Event updates
        this.on('event_update', (data) => {
            apiClient.clearCache('/events');
            this.emitLocal('event_update', data);
        });

        // Forum updates
        this.on('forum_update', (data) => {
            apiClient.clearCache('/forums');
            this.emitLocal('forum_update', data);
        });

        // Chat messages
        this.on('new_message', (data) => {
            devLog('UnifiedSocket', 'Received new_message event', data);
            if (data.roomId) {
                apiClient.clearCache(`/chat/rooms/${data.roomId}/messages`);
            }
            this.emitLocal('new_message', data);
        });

        // Personal messages
        this.on('private_message', (data) => {
            devLog('UnifiedSocket', 'Received private_message event', data);
            apiClient.clearCache('/messages');
            this.emitLocal('private_message', data);
        });

        // User status
        this.on('user_status_update', (data) => {
            this.emitLocal('user_status_update', data);
        });

        // Typing indicators
        this.on('user_typing', (data) => {
            this.emitLocal('user_typing', data);
        });

        // Dashboard updates
        this.on('dashboard_update', (data) => {
            apiClient.clearCache('/dashboard');
            this.emitLocal('dashboard_update', data);
        });
    }

    // =====================================================
    // Reconnection Logic
    // =====================================================

    /**
     * Attempt to reconnect
     */
    async attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            devError('UnifiedSocket', 'Max reconnection attempts reached');
            this.emitLocal('max_reconnect_attempts_reached');
            return;
        }

        this.reconnectAttempts++;
        devLog('UnifiedSocket', `Reconnection attempt ${this.reconnectAttempts}`);

        // Exponential backoff
        const delay = Math.min(
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
            10000
        );

        await new Promise(resolve => setTimeout(resolve, delay));

        if (this.userId && !this.socket?.connected) {
            await this.connect(this.userId);
        }
    }

    /**
     * Re-register all event handlers after reconnection
     */
    reregisterAllHandlers() {
        this.eventHandlers.forEach((callbacks, event) => {
            callbacks.forEach(callback => {
                this.socket.off(event, callback);
                this.socket.on(event, callback);
            });
        });
        
        // Re-setup app handlers
        this.setupAppEventHandlers();
    }

    /**
     * Rejoin all rooms after reconnection
     */
    rejoinAllRooms() {
        this.roomStates.forEach((state, roomId) => {
            if (state.joined) {
                devLog('UnifiedSocket', `Rejoining room: ${roomId}`);
                this.emit('joinRoom', roomId);
            }
        });
    }

    // =====================================================
    // Status Methods
    // =====================================================

    /**
     * Check if connected
     * @returns {boolean} Is connected
     */
    isConnected() {
        return this.socket?.connected === true;
    }

    /**
     * Check if authenticated
     * @returns {boolean} Is authenticated
     */
    isAuthed() {
        return this.isAuthenticated;
    }

    /**
     * Get connection state
     * @returns {string} Connection state
     */
    getConnectionState() {
        return this.connectionState;
    }

    /**
     * Get socket ID
     * @returns {string|null} Socket ID
     */
    getSocketId() {
        return this.socket?.id || null;
    }

    /**
     * Get user ID
     * @returns {string|null} User ID
     */
    getUserId() {
        return this.userId;
    }

    // =====================================================
    // Debug Methods
    // =====================================================

    /**
     * Enable debug mode
     */
    enableDebug() {
        this.debugMode = true;
        if (this.socket) {
            this.socket.offAny();
            this.socket.onAny((eventName, ...args) => {
                devLog('UnifiedSocket', `Event: ${eventName}`, args);
            });
        }
    }

    /**
     * Disable debug mode
     */
    disableDebug() {
        this.debugMode = false;
        if (this.socket) {
            this.socket.offAny();
        }
    }

    /**
     * Get debug info
     * @returns {Object} Debug information
     */
    getDebugInfo() {
        return {
            connected: this.isConnected(),
            authenticated: this.isAuthenticated,
            connectionState: this.connectionState,
            socketId: this.getSocketId(),
            userId: this.userId,
            reconnectAttempts: this.reconnectAttempts,
            joinedRooms: this.getJoinedRooms(),
            registeredEvents: Array.from(this.eventHandlers.keys()),
            localEvents: Array.from(this.localListeners.keys())
        };
    }
}

// Create singleton instance
const unifiedSocketService = new UnifiedSocketService();

// Export singleton
export default unifiedSocketService;

// Export class for testing
export { UnifiedSocketService };