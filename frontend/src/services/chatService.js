import apiClient from './api/client';
import socketService from './socketService';
import mockChatService from './mockChatService';
import { USE_MOCK, devLog } from '../config/development';

const chatService = {
    // Initialize chat connection
    async initializeChat(userId) {
        if (USE_MOCK) {
            devLog('Chat', 'Using mock chat service');
            return Promise.resolve();
        }

        try {
            // Try to connect socket
            await socketService.connect(userId);
            return true;
        } catch (error) {
            console.error('Failed to initialize chat:', error);
            // Continue without socket - API fallback will be used
            return false;
        }
    },

    // Get room messages with fallback
    async getRoomMessages(roomId, options = {}) {
        if (USE_MOCK) {
            return mockChatService.getRoomMessages(roomId);
        }

        try {
            const params = {
                limit: options.limit || 50,
                ...(options.before && { before: options.before })
            };

            const response = await apiClient.get(`/chat/rooms/${roomId}/messages`, { params });
            return response || [];
        } catch (error) {
            console.error('Error fetching messages:', error);
            
            // Fallback to mock data in development
            if (__DEV__) {
                console.log('Using mock messages due to API error');
                return mockChatService.getRoomMessages(roomId);
            }
            
            return [];
        }
    },

    // Send message with fallback
    async sendMessage(roomId, content, type = 'text', attachments = []) {
        // Try socket first if connected
        if (socketService.isConnected()) {
            socketService.sendMessage({
                roomId,
                content,
                type,
                attachments
            });
            return;
        }

        // Fallback to API
        try {
            const response = await apiClient.post(`/chat/rooms/${roomId}/messages`, {
                content,
                type,
                attachments
            });
            return response;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    // Join room with error handling
    async joinRoom(roomId) {
        if (socketService.isConnected()) {
            socketService.joinRoom(roomId);
        }
        
        // Always return messages regardless of socket status
        return this.getRoomMessages(roomId);
    },

    // Leave room
    leaveRoom(roomId) {
        if (socketService.isConnected()) {
            socketService.leaveRoom(roomId);
        }
    },

    // Check connection status
    isConnected() {
        return socketService.isConnected();
    },

    // Cleanup
    disconnect() {
        socketService.disconnect();
    }
};

export default chatService;