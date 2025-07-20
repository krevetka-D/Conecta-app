import io from 'socket.io-client';
import { API_BASE_URL } from '../config/network';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    async connect(userId) {
        if (this.socket?.connected) return;

        const token = await AsyncStorage.getItem('userToken');
        const socketUrl = API_BASE_URL.replace('/api', '');

        this.socket = io(socketUrl, {
            auth: {
                token
            },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('Socket connected');
            this.socket.emit('authenticate', { userId });
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        return new Promise((resolve) => {
            this.socket.on('connect', () => {
                resolve();
            });
        });
    }

    joinRoom(roomId) {
        if (this.socket?.connected) {
            this.socket.emit('joinRoom', roomId);
        }
    }

    leaveRoom(roomId) {
        if (this.socket?.connected) {
            this.socket.emit('leaveRoom', roomId);
        }
    }

    sendMessage(data) {
        if (this.socket?.connected) {
            this.socket.emit('sendMessage', data);
        }
    }

    typing(roomId, isTyping) {
        if (this.socket?.connected) {
            this.socket.emit('typing', { roomId, isTyping });
        }
    }

    addReaction(messageId, emoji) {
        if (this.socket?.connected) {
            this.socket.emit('addReaction', { messageId, emoji });
        }
    }

    deleteMessage(messageId) {
        if (this.socket?.connected) {
            this.socket.emit('deleteMessage', { messageId });
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
            
            // Track listeners for cleanup
            if (!this.listeners.has(event)) {
                this.listeners.set(event, new Set());
            }
            this.listeners.get(event).add(callback);
        }
    }

    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
            
            // Remove from tracked listeners
            if (this.listeners.has(event)) {
                this.listeners.get(event).delete(callback);
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

            this.socket.disconnect();
            this.socket = null;
        }
    }

    isConnected() {
        return this.socket?.connected || false;
    }
}

export default new SocketService();