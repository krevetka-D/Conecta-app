import { USE_MOCK } from '../config/development';
import { devLog, devWarn, devError } from '../utils/devLog';

import apiClient from './api/client';
import mockChatService from './mockChatService';
import socketService from './socketService';

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
                ...(options.before && { before: options.before }),
            };

            // Fixed: Use correct endpoint structure with cache disabled
            const response = await apiClient.get(`/chat/rooms/${roomId}/messages`, { 
                params,
                cache: false // Disable caching for real-time messages
            });

            // Handle different response structures from backend
            let messages = [];

            // If backend returns wrapped response: { data: { messages: [...] } }
            if (response && response.data && Array.isArray(response.data.messages)) {
                devLog('ChatService', `Retrieved ${response.data.messages.length} messages from response.data.messages`);
                messages = response.data.messages;
            }
            // If backend returns: { messages: [...] }
            else if (response && Array.isArray(response.messages)) {
                devLog('ChatService', `Retrieved ${response.messages.length} messages from response.messages`);
                messages = response.messages;
            }
            // If backend returns array directly
            else if (Array.isArray(response)) {
                devLog('ChatService', `Retrieved ${response.length} messages (array response)`);
                messages = response;
            }
            // Fallback: check if response itself looks like a message array
            else if (response && response.length !== undefined) {
                devLog('ChatService', 'Converting array-like response to array');
                messages = Array.from(response);
            }
            
            // Return the entire response if it contains messages
            if (response && response.messages) {
                return response; // Return entire response object
            }

            // Validate messages have required structure
            const validMessages = messages.filter((msg) => {
                if (!msg) return false;
                if (!msg._id) {
                    devLog('ChatService', 'Message missing _id:', msg);
                    return false;
                }
                if (!msg.sender) {
                    devLog('ChatService', 'Message missing sender:', msg);
                    return false;
                }
                if (msg.content === undefined) {
                    devLog('ChatService', 'Message missing content:', msg);
                    return false;
                }
                return true;
            });

            if (validMessages.length !== messages.length) {
                devWarn(
                    'ChatService',
                    `Filtered out ${messages.length - validMessages.length} invalid messages from room ${roomId}`,
                );
                // Log the first few invalid messages for debugging
                const invalidMessages = messages.filter(msg => !validMessages.includes(msg));
                invalidMessages.slice(0, 3).forEach((msg, index) => {
                    devLog('ChatService', `Invalid message ${index + 1}:`, msg);
                });
            }

            return validMessages;
        } catch (error) {
            devError('ChatService', 'Error fetching messages', error);

            // Fallback to mock data in development
            if (__DEV__) {
                devLog('ChatService', 'Using mock messages due to API error');
                return mockChatService.getRoomMessages(roomId);
            }

            return [];
        }
    },

    // Send message with fallback
    async sendMessage(roomId, content, type = 'text', attachments = []) {
        devLog('ChatService', '📤 Sending message', { roomId, content, type });
        
        // Always use API to ensure message is saved
        // Socket will handle real-time delivery
        try {
            const response = await apiClient.post(`/chat/rooms/${roomId}/messages`, {
                content,
                type,
                attachments,
            });
            
            devLog('ChatService', '✅ Message sent via API', response);
            
            // The backend should emit the message via socket
            // so we just return the response
            return response;
        } catch (error) {
            devError('ChatService', 'Error sending message', error);
            throw error;
        }
    },

    // Get chat rooms
    async getChatRooms() {
        if (USE_MOCK) {
            return mockChatService.getRooms();
        }

        try {
            const response = await apiClient.get('/chat/rooms', {
                cache: false // Disable caching for real-time room data
            });
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
    },
};

export default chatService;
