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

            // Fixed: Use correct endpoint structure
            const response = await apiClient.get(`/chat/rooms/${roomId}/messages`, { params });
            
            // Debug log to see the response structure
            console.log('getRoomMessages raw response:', response);
            
            // Handle different response structures from backend
            let messages = [];
            
            // If backend returns wrapped response: { data: { messages: [...] } }
            if (response && response.data && Array.isArray(response.data.messages)) {
                console.log('Found messages in response.data.messages:', response.data.messages.length);
                messages = response.data.messages;
            }
            // If backend returns: { messages: [...] }
            else if (response && Array.isArray(response.messages)) {
                console.log('Found messages in response.messages:', response.messages.length);
                messages = response.messages;
            }
            // If backend returns array directly
            else if (Array.isArray(response)) {
                console.log('Response is already an array:', response.length);
                messages = response;
            }
            // Fallback: check if response itself looks like a message array
            else if (response && response.length !== undefined) {
                console.log('Response might be array-like');
                messages = Array.from(response);
            }
            
            // Validate messages have required structure
            const validMessages = messages.filter(msg => 
                msg && msg._id && msg.sender && msg.content !== undefined
            );
            
            if (validMessages.length !== messages.length) {
                console.warn(`Filtered out ${messages.length - validMessages.length} invalid messages`);
            }
            
            return validMessages;
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
            // Fixed: Use correct endpoint structure
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

    // Get chat rooms
    async getChatRooms() {
        if (USE_MOCK) {
            return mockChatService.getRooms();
        }

        try {
            const response = await apiClient.get('/chat/rooms');
            return response || [];
        } catch (error) {
            console.error('Error fetching chat rooms:', error);
            
            // Fallback to mock data in development
            if (__DEV__) {
                console.log('Using mock rooms due to API error');
                return mockChatService.getRooms();
            }
            
            return [];
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