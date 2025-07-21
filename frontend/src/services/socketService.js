import io from 'socket.io-client';
import { API_BASE_URL } from '../config/network';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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
        if (this.socket?.connected || this.isConnecting) {
            console.log('Socket already connected or connecting');
            return Promise.resolve();
        }

        this.isConnecting = true;
        this.userId = userId;

        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Clear any existing connection
            this.disconnect();

            // Determine socket URL
            const socketUrl = this.getSocketUrl();
            console.log('Connecting to socket:', socketUrl);

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
                    this.socket.disconnect();
                    reject(new Error('Connection timeout'));
                }, 30000);

                this.socket.once('connect', () => {
                    clearTimeout(this.connectionTimeout);
                    console.log('Socket connected successfully');
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
                    console.error('Socket connection error:', error.message);
                    reject(error);
                });
            });
        } catch (error) {
            this.isConnecting = false;
            throw error;
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
        // Connection events
        this.socket.on('connect', () => {
            console.log('Socket connected, ID:', this.socket.id);
            this.flushMessageQueue();
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            this.stopHeartbeat();
            this.isAuthenticated = false;
            
            if (reason === 'io server disconnect') {
                // Server disconnected us, try to reconnect
                setTimeout(() => {
                    if (this.userId) {
                        this.connect(this.userId);
                    }
                }, 1000);
            }
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('Socket reconnected after', attemptNumber, 'attempts');
            this.authenticate(this.userId);
            this.flushMessageQueue();
        });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
            console.log('Reconnection attempt', attemptNumber);
            this.reconnectAttempts = attemptNumber;
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        // Custom events
        this.socket.on('authenticated', (data) => {
            console.log('Socket authenticated:', data);
            this.isAuthenticated = true;
            this.emit('authenticated', data);
        });

        this.socket.on('auth_error', (data) => {
            console.error('Socket authentication error:', data);
            this.isAuthenticated = false;
        });

        this.socket.on('heartbeat_ack', () => {
            // Heartbeat acknowledged
        });
    }

    authenticate(userId) {
        if (this.socket?.connected) {
            console.log('Authenticating socket for user:', userId);
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
        } else {
            // Queue the message if not connected or authenticated
            this.messageQueue.push({ event, data });
            console.warn('Socket not ready, message queued:', event);
        }
    }

    on(event, callback) {
        if (!this.socket) {
            console.warn('Socket not initialized');
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

    markMessagesAsRead(roomId, messageIds) {
        this.emit('markAsRead', { roomId, messageIds });
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
        if (this.isConnecting || this.socket?.connected) {
            return;
        }

        const backoffDelay = Math.min(
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
            30000 // Max 30 seconds
        );

        console.log(`Retrying connection in ${backoffDelay}ms`);
        
        setTimeout(async () => {
            if (this.userId) {
                try {
                    await this.connect(this.userId);
                } catch (error) {
                    console.error('Retry connection failed:', error);
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