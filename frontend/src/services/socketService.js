// frontend/src/services/socketService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import io from 'socket.io-client';

import { USE_WEBSOCKET, devLog } from '../config/development';
import { API_BASE_URL } from '../config/network';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.messageQueue = [];
        this.isConnecting = false;
        this.isAuthenticated = false;
        this.heartbeatInterval = null;
        this.connectionTimeout = null;
        this.userId = null;
        this.userStatusListeners = new Map();
        this.connectionState = 'disconnected'; // 'disconnected', 'connecting', 'connected'
        this.statusUpdateCallbacks = new Map();
    }

    async connect(userId) {
        // Always attempt connection in production, skip only in development if disabled
        const shouldConnect = __DEV__ ? USE_WEBSOCKET : true;

        if (!shouldConnect) {
            devLog('Socket', 'WebSocket disabled in configuration');
            return Promise.resolve();
        }

        if (this.socket?.connected || this.isConnecting) {
            devLog('Socket', 'Already connected or connecting');
            return Promise.resolve();
        }

        this.isConnecting = true;
        this.connectionState = 'connecting';
        this.userId = userId;

        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                devLog('Socket', 'No authentication token found, skipping socket connection');
                this.isConnecting = false;
                this.connectionState = 'disconnected';
                return Promise.resolve();
            }

            // Clear any existing connection
            this.disconnect();

            // Determine socket URL
            const socketUrl = this.getSocketUrl();
            devLog('Socket', `Attempting connection to: ${socketUrl}`);

            // Create socket connection with optimized settings
            this.socket = io(socketUrl, {
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: this.reconnectDelay,
                reconnectionDelayMax: 5000,
                timeout: 20000,
                autoConnect: false,
                forceNew: true,

                // Platform-specific options
                ...(Platform.OS === 'android' && {
                    jsonp: false,
                    forceBase64: true,
                }),

                // Query parameters
                query: {
                    platform: Platform.OS,
                    version: '1.0.0',
                    userId: userId,
                },
            });

            this.setupEventHandlers();

            // Connect socket
            this.socket.connect();

            return new Promise((resolve, reject) => {
                this.connectionTimeout = setTimeout(() => {
                    this.isConnecting = false;
                    this.connectionState = 'disconnected';
                    if (this.socket && !this.socket.connected) {
                        this.socket.disconnect();
                    }
                    devLog('Socket', 'Connection timeout - continuing without socket');
                    resolve(); // Resolve instead of reject to allow app to continue
                }, 15000);

                this.socket.once('connect', () => {
                    clearTimeout(this.connectionTimeout);
                    devLog('Socket', 'Connected successfully');
                    this.isConnecting = false;
                    this.connectionState = 'connected';
                    this.reconnectAttempts = 0;

                    // Start heartbeat
                    this.startHeartbeat();

                    // Authenticate
                    this.authenticate(userId);

                    // Update user status to online
                    this.updateUserStatus(true);

                    resolve();
                });

                this.socket.once('connect_error', (error) => {
                    clearTimeout(this.connectionTimeout);
                    this.isConnecting = false;
                    this.connectionState = 'disconnected';
                    devLog(
                        'Socket',
                        `Connection error: ${error.message} - continuing without socket`,
                    );
                    resolve(); // Resolve instead of reject to allow app to continue
                });
            });
        } catch (error) {
            this.isConnecting = false;
            this.connectionState = 'disconnected';
            devLog('Socket', `Connection failed: ${error.message} - continuing without socket`);
            return Promise.resolve(); // Allow app to continue without socket
        }
    }

    getSocketUrl() {
        // Remove /api suffix from base URL
        const baseUrl = API_BASE_URL.replace('/api', '');

        if (__DEV__) {
            // Development URLs
            if (Platform.OS === 'ios') {
                return baseUrl.replace('localhost', 'localhost');
            } else if (Platform.OS === 'android') {
                return baseUrl.replace('localhost', '10.0.2.2');
            }
        }

        // Production or web
        return baseUrl.replace('http:', 'ws:').replace('https:', 'wss:');
    }

    setupEventHandlers() {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            this.connectionState = 'connected';
            devLog('Socket', `Connected with ID: ${this.socket.id}`);

            // Re-authenticate on reconnection
            if (this.userId) {
                this.authenticate(this.userId);
            }

            this.updateUserStatus(true);
            this.flushMessageQueue();
            this.notifyConnectionStateChange('connected');
        });

        this.socket.on('disconnect', (reason) => {
            this.connectionState = 'disconnected';
            devLog('Socket', `Disconnected: ${reason}`);
            this.stopHeartbeat();
            this.isAuthenticated = false;
            this.updateUserStatus(false);
            this.notifyConnectionStateChange('disconnected');

            // Auto-reconnect for certain disconnect reasons
            if (reason === 'io server disconnect' || reason === 'transport close') {
                setTimeout(() => {
                    if (this.userId && this.connectionState === 'disconnected') {
                        this.connect(this.userId);
                    }
                }, 2000);
            }
        });

        this.socket.on('reconnect', (attemptNumber) => {
            devLog('Socket', `Reconnected after ${attemptNumber} attempts`);
            this.authenticate(this.userId);
            this.updateUserStatus(true);
            this.flushMessageQueue();
        });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
            devLog('Socket', `Reconnection attempt ${attemptNumber}`);
            this.reconnectAttempts = attemptNumber;
        });

        this.socket.on('error', (error) => {
            devLog('Socket', `Error: ${error.message || error}`);
        });

        // Custom events
        this.socket.on('authenticated', (data) => {
            devLog('Socket', 'Authenticated successfully');
            this.isAuthenticated = true;
            this.emit('authenticated', data);

            // Update online status after authentication
            this.updateUserStatus(true);
        });

        this.socket.on('auth_error', (data) => {
            devLog('Socket', `Authentication error: ${data.message || 'Unknown error'}`);
            this.isAuthenticated = false;
        });

        this.socket.on('heartbeat_ack', () => {
            // Heartbeat acknowledged
        });

        // User status events
        this.socket.on('user_status_update', (data) => {
            devLog('Socket', `User ${data.userId} is ${data.isOnline ? 'online' : 'offline'}`);
            this.handleUserStatusUpdate(data);
            this.notifyStatusUpdate(data);
        });

        this.socket.on('user_status_response', (data) => {
            this.notifyStatusUpdate(data);
        });

        this.socket.on('users_online', (data) => {
            devLog('Socket', `Online users: ${data.users.length}`);
            this.handleOnlineUsersList(data.users);
            this.notifyOnlineUsers(data.users);
        });

        this.socket.on('online_users', (data) => {
            this.notifyOnlineUsers(data.users);
        });
    }

    authenticate(userId) {
        if (this.socket?.connected) {
            devLog('Socket', `Authenticating for user: ${userId}`);
            this.socket.emit('authenticate', { userId });
        }
    }

    startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatInterval = setInterval(() => {
            if (this.socket?.connected) {
                this.socket.emit('heartbeat');
            }
        }, 25000); // 25 seconds
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    updateUserStatus(isOnline) {
        if (this.socket?.connected && this.isAuthenticated) {
            devLog('Socket', `Updating user status to ${isOnline ? 'online' : 'offline'}`);
            this.socket.emit('update_status', { isOnline });
        }
    }

    handleUserStatusUpdate(data) {
        // Notify all listeners about user status change
        this.userStatusListeners.forEach((callback) => {
            callback(data);
        });
    }

    handleOnlineUsersList(users) {
        // Notify all listeners about online users list
        this.emit('online_users', users);
    }

    // Enhanced subscribe to user status updates
    subscribeToUserStatus(userId, callback) {
        const id = `${userId}_${Date.now()}`;
        this.statusUpdateCallbacks.set(id, { userId, callback });

        // Also add to legacy listeners for backward compatibility
        const listenerId = `${userId}_${Date.now()}_legacy`;
        this.userStatusListeners.set(listenerId, callback);

        // Request current status
        if (this.isConnected()) {
            this.socket.emit('get_user_status', { userId });
        }

        // Return unsubscribe function
        return () => {
            this.statusUpdateCallbacks.delete(id);
            this.userStatusListeners.delete(listenerId);
        };
    }

    unsubscribeFromUserStatus(listenerId) {
        this.userStatusListeners.delete(listenerId);
    }

    // Notify all status update subscribers
    notifyStatusUpdate(data) {
        this.statusUpdateCallbacks.forEach(({ userId, callback }) => {
            if (userId === data.userId) {
                callback(data);
            }
        });
    }

    // Connection state change notifications
    notifyConnectionStateChange(state) {
        this.emit('connection_state_change', state);
    }

    // Notify online users
    notifyOnlineUsers(users) {
        this.emit('online_users_update', users);
    }

    // Get current connection state
    getConnectionState() {
        return this.connectionState;
    }

    // Force reconnect
    forceReconnect() {
        this.disconnect();
        if (this.userId) {
            setTimeout(() => this.connect(this.userId), 1000);
        }
    }

    flushMessageQueue() {
        while (this.messageQueue.length > 0 && this.socket?.connected) {
            const { event, data } = this.messageQueue.shift();
            this.socket.emit(event, data);
        }
    }

    emit(event, data) {
        if (this.socket?.connected && this.isAuthenticated) {
            this.socket.emit(event, data);
        } else {
            // Queue messages when not connected
            this.messageQueue.push({ event, data });
            devLog('Socket', `Message queued: ${event}`);
        }
    }

    on(event, callback) {
        if (!this.socket) {
            devLog('Socket', 'Not initialized - event listener not added');
            return;
        }

        // Remove existing listener if it exists
        this.off(event, callback);

        this.socket.on(event, callback);

        // Track listeners for cleanup
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    off(event, callback) {
        if (!this.socket) return;

        this.socket.off(event, callback);

        // Remove from tracked listeners
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
            if (this.listeners.get(event).size === 0) {
                this.listeners.delete(event);
            }
        }
    }

    // Chat-specific methods
    joinRoom(roomId) {
        if (this.isConnected()) {
            this.emit('joinRoom', roomId);
        }
    }

    leaveRoom(roomId) {
        if (this.isConnected()) {
            this.emit('leaveRoom', roomId);
        }
    }

    sendMessage(data) {
        this.emit('sendMessage', data);
    }

    typing(roomId, isTyping) {
        if (this.isConnected()) {
            this.emit('typing', { roomId, isTyping });
        }
    }

    markMessagesAsRead(roomId, messageIds) {
        if (this.isConnected()) {
            this.emit('markAsRead', { roomId, messageIds });
        }
    }

    // Personal messaging methods
    sendPersonalMessage(data) {
        this.emit('private_message', data);
    }

    markPersonalMessageAsRead(messageIds, conversationId) {
        if (this.isConnected()) {
            this.emit('mark_personal_messages_read', { messageIds, conversationId });
        }
    }

    // Update typing to support both room and personal messages
    typingPersonal(recipientId, isTyping) {
        if (this.isConnected()) {
            this.emit('personal_typing', { recipientId, isTyping });
        }
    }

    // Join personal conversation
    joinPersonalConversation(conversationId) {
        if (this.isConnected()) {
            this.emit('join_personal_conversation', conversationId);
        }
    }

    // Leave personal conversation
    leavePersonalConversation(conversationId) {
        if (this.isConnected()) {
            this.emit('leave_personal_conversation', conversationId);
        }
    }

    // Get online status for a user
    getUserOnlineStatus(userId) {
        if (this.isConnected()) {
            this.emit('get_user_status', { userId });
        }
    }

    // Block/unblock user
    blockUser(userId, block = true) {
        if (this.isConnected()) {
            this.emit(block ? 'block_user' : 'unblock_user', userId);
        }
    }

    disconnect() {
        this.stopHeartbeat();

        if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
        }

        if (this.socket) {
            // Update status to offline before disconnecting
            this.updateUserStatus(false);

            // Remove all socket event listeners
            this.socket.removeAllListeners();
            
            // Remove all custom listeners
            this.listeners.forEach((callbacks, event) => {
                callbacks.forEach((callback) => {
                    this.socket.off(event, callback);
                });
            });
            this.listeners.clear();
            this.userStatusListeners.clear();
            this.statusUpdateCallbacks.clear();

            // Clear message queue
            this.messageQueue = [];

            // Disconnect socket
            this.socket.disconnect();
            this.socket = null;
        }

        // Clear all references
        this.isAuthenticated = false;
        this.isConnecting = false;
        this.connectionState = 'disconnected';
        this.userId = null;
        this.currentRoom = null;
        this.typingTimeout = null;
    }

    isConnected() {
        return this.socket?.connected && this.isAuthenticated;
    }

    getSocketId() {
        return this.socket?.id || null;
    }

    // Retry connection with exponential backoff
    async retryConnection() {
        if (this.isConnecting || this.socket?.connected) {
            return;
        }

        const backoffDelay = Math.min(
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
            30000, // Max 30 seconds
        );

        devLog('Socket', `Retrying connection in ${backoffDelay}ms`);

        setTimeout(async () => {
            if (this.userId) {
                try {
                    await this.connect(this.userId);
                } catch (error) {
                    devLog('Socket', `Retry failed: ${error.message}`);
                    this.reconnectAttempts++;
                    if (this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.retryConnection();
                    }
                }
            }
        }, backoffDelay);
    }
}

// Create singleton instance
const socketService = new SocketService();

// Export for debugging in development
if (__DEV__) {
    global.socketService = socketService;
}

export default socketService;
