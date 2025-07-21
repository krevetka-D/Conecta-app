// frontend/src/services/socketService.js
import io from 'socket.io-client';
import { API_BASE_URL } from '../config/network';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { USE_WEBSOCKET, devLog } from '../config/development';

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
    }

    async connect(userId) {
        // Skip socket connection in development if disabled
        if (!USE_WEBSOCKET) {
            devLog('Socket', 'WebSocket disabled in development configuration');
            return Promise.resolve();
        }

        if (this.socket?.connected || this.isConnecting) {
            devLog('Socket', 'Already connected or connecting');
            return Promise.resolve();
        }

        this.isConnecting = true;
        this.userId = userId;

        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                devLog('Socket', 'No authentication token found, skipping socket connection');
                this.isConnecting = false;
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
                
                // Platform-specific options
                ...(Platform.OS === 'android' && {
                    jsonp: false,
                    forceBase64: true
                }),
                
                // Query parameters
                query: {
                    platform: Platform.OS,
                    version: '1.0.0'
                }
            });

            this.setupEventHandlers();
            
            // Connect socket
            this.socket.connect();

            return new Promise((resolve, reject) => {
                this.connectionTimeout = setTimeout(() => {
                    this.isConnecting = false;
                    if (this.socket) {
                        this.socket.disconnect();
                    }
                    devLog('Socket', 'Connection timeout - continuing without socket');
                    resolve(); // Resolve instead of reject to allow app to continue
                }, 10000); // Reduced timeout to 10 seconds

                this.socket.once('connect', () => {
                    clearTimeout(this.connectionTimeout);
                    devLog('Socket', 'Connected successfully');
                    this.isConnecting = false;
                    this.reconnectAttempts = 0;
                    
                    // Start heartbeat
                    this.startHeartbeat();
                    
                    // Authenticate
                    this.authenticate(userId);
                    
                    resolve();
                });

                this.socket.once('connect_error', (error) => {
                    clearTimeout(this.connectionTimeout);
                    this.isConnecting = false;
                    devLog('Socket', `Connection error: ${error.message} - continuing without socket`);
                    resolve(); // Resolve instead of reject to allow app to continue
                });
            });
        } catch (error) {
            this.isConnecting = false;
            devLog('Socket', `Connection failed: ${error.message} - continuing without socket`);
            return Promise.resolve(); // Allow app to continue without socket
        }
    }

    getSocketUrl() {
        if (__DEV__) {
            // Development URLs
            if (Platform.OS === 'ios') {
                return 'http://localhost:5001';
            } else if (Platform.OS === 'android') {
                return 'http://10.0.2.2:5001';
            } else {
                // Web or physical device
                const baseUrl = API_BASE_URL.replace('/api', '');
                return baseUrl;
            }
        } else {
            // Production URL
            return 'https://api.conectaalicante.com';
        }
    }

    setupEventHandlers() {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            devLog('Socket', `Connected with ID: ${this.socket.id}`);
            this.flushMessageQueue();
        });

        this.socket.on('disconnect', (reason) => {
            devLog('Socket', `Disconnected: ${reason}`);
            this.stopHeartbeat();
            this.isAuthenticated = false;
            
            if (reason === 'io server disconnect') {
                // Server disconnected us, try to reconnect
                setTimeout(() => {
                    if (this.userId && USE_WEBSOCKET) {
                        this.connect(this.userId);
                    }
                }, 1000);
            }
        });

        this.socket.on('reconnect', (attemptNumber) => {
            devLog('Socket', `Reconnected after ${attemptNumber} attempts`);
            this.authenticate(this.userId);
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
        });

        this.socket.on('auth_error', (data) => {
            devLog('Socket', `Authentication error: ${data.message || 'Unknown error'}`);
            this.isAuthenticated = false;
        });

        this.socket.on('heartbeat_ack', () => {
            // Heartbeat acknowledged
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

    flushMessageQueue() {
        while (this.messageQueue.length > 0 && this.socket?.connected) {
            const { event, data } = this.messageQueue.shift();
            this.socket.emit(event, data);
        }
    }

    emit(event, data) {
        if (this.socket?.connected && this.isAuthenticated) {
            this.socket.emit(event, data);
        } else if (USE_WEBSOCKET) {
            // Only queue messages if WebSocket is enabled
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
            this.emit('get_user_status', userId);
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
            // Remove all listeners
            this.listeners.forEach((callbacks, event) => {
                callbacks.forEach(callback => {
                    this.socket.off(event, callback);
                });
            });
            this.listeners.clear();

            // Clear message queue
            this.messageQueue = [];

            // Disconnect socket
            this.socket.disconnect();
            this.socket = null;
        }
        
        this.isAuthenticated = false;
        this.isConnecting = false;
        this.userId = null;
    }

    isConnected() {
        return this.socket?.connected && this.isAuthenticated;
    }

    getSocketId() {
        return this.socket?.id || null;
    }

    // Retry connection with exponential backoff
    async retryConnection() {
        if (!USE_WEBSOCKET || this.isConnecting || this.socket?.connected) {
            return;
        }

        const backoffDelay = Math.min(
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
            30000 // Max 30 seconds
        );

        devLog('Socket', `Retrying connection in ${backoffDelay}ms`);
        
        setTimeout(async () => {
            if (this.userId && USE_WEBSOCKET) {
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