/**
 * Optimized Socket Manager
 * Simplified and reliable socket connection management
 */

import socketService from '../services/socketService';
import { devLog, devError } from './devLog';

class OptimizedSocketManager {
    constructor() {
        this.messageHandlers = new Map();
        this.roomStates = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    /**
     * Initialize socket connection for a user
     * @param {string} userId - User ID
     * @returns {Promise<boolean>} Connection success
     */
    async initializeConnection(userId) {
        try {
            devLog('OptimizedSocket', `Initializing connection for user ${userId}`);
            
            // Connect to socket
            await socketService.connect(userId);
            
            // Setup global event handlers
            this.setupGlobalHandlers();
            
            // Reset reconnect attempts on successful connection
            this.reconnectAttempts = 0;
            
            return true;
        } catch (error) {
            devError('OptimizedSocket', 'Failed to initialize connection', error);
            return false;
        }
    }

    /**
     * Join a chat room
     * @param {string} roomId - Room ID
     * @param {Object} handlers - Event handlers
     * @returns {Promise<boolean>} Join success
     */
    async joinRoom(roomId, handlers = {}) {
        if (!roomId) {
            devError('OptimizedSocket', 'No room ID provided');
            return false;
        }

        try {
            // Store handlers
            this.messageHandlers.set(roomId, handlers);
            
            // Join room via socket
            socketService.joinRoom(roomId);
            
            // Setup room-specific listeners
            this.setupRoomListeners(roomId);
            
            // Mark room as joined
            this.roomStates.set(roomId, { joined: true, joinedAt: new Date() });
            
            devLog('OptimizedSocket', `Joined room ${roomId}`);
            return true;
        } catch (error) {
            devError('OptimizedSocket', `Failed to join room ${roomId}`, error);
            return false;
        }
    }

    /**
     * Leave a chat room
     * @param {string} roomId - Room ID
     */
    leaveRoom(roomId) {
        if (!roomId) return;

        // Leave room via socket
        socketService.leaveRoom(roomId);
        
        // Remove handlers
        this.messageHandlers.delete(roomId);
        
        // Update room state
        this.roomStates.delete(roomId);
        
        devLog('OptimizedSocket', `Left room ${roomId}`);
    }

    /**
     * Setup global socket event handlers
     */
    setupGlobalHandlers() {
        // Connection events
        socketService.on('connect', () => {
            devLog('OptimizedSocket', 'Socket connected');
            this.handleReconnection();
        });

        socketService.on('disconnect', (reason) => {
            devLog('OptimizedSocket', `Socket disconnected: ${reason}`);
            if (reason === 'io server disconnect') {
                // Server disconnected us, try to reconnect
                this.attemptReconnect();
            }
        });

        // Authentication events
        socketService.on('authenticated', () => {
            devLog('OptimizedSocket', 'Socket authenticated');
            // Rejoin all rooms after authentication
            this.rejoinAllRooms();
        });

        // Error handling
        socketService.on('error', (error) => {
            devError('OptimizedSocket', 'Socket error', error);
        });
    }

    /**
     * Setup room-specific listeners
     * @param {string} roomId - Room ID
     */
    setupRoomListeners(roomId) {
        const handlers = this.messageHandlers.get(roomId) || {};

        // Room join confirmation
        const roomJoinHandler = (data) => {
            if (data.roomId === roomId && data.success) {
                devLog('OptimizedSocket', `Room ${roomId} join confirmed`);
                this.roomStates.set(roomId, { 
                    ...this.roomStates.get(roomId),
                    confirmed: true,
                    memberCount: data.memberCount
                });
                
                if (handlers.onRoomJoined) {
                    handlers.onRoomJoined(data);
                }
            }
        };
        socketService.on('room_joined', roomJoinHandler);

        // New message handler
        const messageHandler = (message) => {
            // Check if message is for this room
            const messageRoomId = String(message.roomId || message.room || '');
            if (messageRoomId === String(roomId)) {
                devLog('OptimizedSocket', `New message in room ${roomId}`);
                if (handlers.onNewMessage) {
                    handlers.onNewMessage(message);
                }
            }
        };
        socketService.on('new_message', messageHandler);

        // Typing indicator
        const typingHandler = (data) => {
            if (data.roomId === roomId && handlers.onUserTyping) {
                handlers.onUserTyping(data);
            }
        };
        socketService.on('user_typing', typingHandler);

        // User joined/left room
        socketService.on('user_joined_room', (data) => {
            if (data.roomId === roomId && handlers.onUserJoined) {
                handlers.onUserJoined(data);
            }
        });

        socketService.on('user_left_room', (data) => {
            if (data.roomId === roomId && handlers.onUserLeft) {
                handlers.onUserLeft(data);
            }
        });

        // Store cleanup function
        this.roomStates.set(roomId, {
            ...this.roomStates.get(roomId),
            cleanup: () => {
                socketService.off('room_joined', roomJoinHandler);
                socketService.off('new_message', messageHandler);
                socketService.off('user_typing', typingHandler);
            }
        });
    }

    /**
     * Handle reconnection
     */
    handleReconnection() {
        this.reconnectAttempts = 0;
        
        // Clear all room states
        this.roomStates.forEach((state, roomId) => {
            state.confirmed = false;
        });
    }

    /**
     * Attempt to reconnect
     */
    async attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            devError('OptimizedSocket', 'Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        devLog('OptimizedSocket', `Reconnection attempt ${this.reconnectAttempts}`);

        // Wait before reconnecting (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));

        // Try to reconnect
        if (socketService.userId) {
            await socketService.forceReconnect();
        }
    }

    /**
     * Rejoin all rooms after reconnection
     */
    rejoinAllRooms() {
        this.roomStates.forEach((state, roomId) => {
            if (state.joined && !state.confirmed) {
                devLog('OptimizedSocket', `Rejoining room ${roomId}`);
                socketService.joinRoom(roomId);
            }
        });
    }

    /**
     * Send a typing indicator
     * @param {string} roomId - Room ID
     * @param {boolean} isTyping - Is typing
     */
    sendTyping(roomId, isTyping) {
        socketService.typing(roomId, isTyping);
    }

    /**
     * Check if connected and authenticated
     * @returns {boolean} Is ready
     */
    isReady() {
        return socketService.isConnected() && socketService.isAuthenticated;
    }

    /**
     * Get room state
     * @param {string} roomId - Room ID
     * @returns {Object} Room state
     */
    getRoomState(roomId) {
        return this.roomStates.get(roomId) || { joined: false, confirmed: false };
    }

    /**
     * Cleanup all resources
     */
    cleanup() {
        // Cleanup all room listeners
        this.roomStates.forEach((state, roomId) => {
            if (state.cleanup) {
                state.cleanup();
            }
            this.leaveRoom(roomId);
        });

        // Clear all maps
        this.messageHandlers.clear();
        this.roomStates.clear();

        // Disconnect socket
        socketService.disconnect();
    }
}

// Create singleton instance
export const optimizedSocketManager = new OptimizedSocketManager();

// Export hook for React components
export const useOptimizedSocket = (roomId, handlers) => {
    const join = async () => {
        const connected = await optimizedSocketManager.initializeConnection(socketService.userId);
        if (connected) {
            return optimizedSocketManager.joinRoom(roomId, handlers);
        }
        return false;
    };

    const leave = () => {
        optimizedSocketManager.leaveRoom(roomId);
    };

    const sendTyping = (isTyping) => {
        optimizedSocketManager.sendTyping(roomId, isTyping);
    };

    return { join, leave, sendTyping, isReady: optimizedSocketManager.isReady() };
};