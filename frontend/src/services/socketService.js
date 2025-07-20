import io from 'socket.io-client';
import { API_BASE_URL } from '../config/network';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
        this.isInitialized = false;
    }

    async connect(userId) {
        // Skip socket connection in development if disabled
        if (!USE_WEBSOCKET) {
            devLog('Socket', 'WebSocket disabled in development mode');
            return Promise.resolve();
        }

        if (this.socket?.connected || this.isConnecting) {
            devLog('Socket', 'Socket already connected or connecting');
            return Promise.resolve();
        }

        this.isConnecting = true;

        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Determine socket URL based on environment
            let socketUrl;
            if (__DEV__) {
                // In development, use the same host as API but without /api
                socketUrl = API_BASE_URL.replace('/api', '');
                devLog('Socket', 'Connecting to socket at:', socketUrl);
            } else {
                // In production
                socketUrl = 'wss://api.conectaalicante.com';
            }

            this.socket = io(socketUrl, {
                auth: { token },
                transports: ['websocket', 'polling'], // Add polling as fallback
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: this.reconnectDelay,
                reconnectionDelayMax: 5000,
                timeout: 20000,
                autoConnect: true,
            });

            this.setupEventHandlers(userId);

            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    this.isConnecting = false;
                    reject(new Error('Connection timeout'));
                }, 30000);

                this.socket.on('connect', () => {
                    clearTimeout(timeout);
                    this.isConnecting = false;
                    this.reconnectAttempts = 0;
                    console.log('Socket connected');
                    this.socket.emit('authenticate', { userId });
                    this.flushMessageQueue();
                    resolve();
                });

                this.socket.on('connect_error', (error) => {
                    clearTimeout(timeout);
                    this.isConnecting = false;
                    console.error('Socket connection error:', error);
                    reject(error);
                });
            });
        } catch (error) {
            this.isConnecting = false;
            throw error;
        }
    }

    setupEventHandlers(userId) {
        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            if (reason === 'io server disconnect') {
                // Server disconnected us, try to reconnect
                this.socket.connect();
            }
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('Socket reconnected after', attemptNumber, 'attempts');
            this.socket.emit('authenticate', { userId });
            this.flushMessageQueue();
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    }

    flushMessageQueue() {
        while (this.messageQueue.length > 0) {
            const { event, data } = this.messageQueue.shift();
            this.socket.emit(event, data);
        }
    }

    emit(event, data) {
        if (this.socket?.connected) {
            this.socket.emit(event, data);
        } else {
            // Queue the message if not connected
            this.messageQueue.push({ event, data });
            console.warn('Socket not connected, message queued:', event);
        }
    }

    joinRoom(roomId) {
        this.emit('joinRoom', roomId);
    }

    leaveRoom(roomId) {
        this.emit('leaveRoom', roomId);
    }

    sendMessage(data) {
        this.emit('sendMessage', data);
    }

    typing(roomId, isTyping) {
        this.emit('typing', { roomId, isTyping });
    }

    addReaction(messageId, emoji) {
        this.emit('addReaction', { messageId, emoji });
    }

    deleteMessage(messageId) {
        this.emit('deleteMessage', { messageId });
    }

    markMessagesAsRead(roomId, messageIds) {
        this.emit('markAsRead', { roomId, messageIds });
    }

    on(event, callback) {
        if (!this.socket) {
            console.warn('Socket not initialized');
            return;
        }

        // Remove existing listener if it exists
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            if (callbacks.has(callback)) {
                return; // Already registered
            }
        }

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

    disconnect() {
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

            this.socket.disconnect();
            this.socket = null;
        }
    }

    isConnected() {
        return this.socket?.connected || false;
    }

    getSocketId() {
        return this.socket?.id || null;
    }
}

// Create singleton instance
const socketService = new SocketService();

// Export for debugging in development
if (__DEV__) {
    global.socketService = socketService;
}

export default socketService;