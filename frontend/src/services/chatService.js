import { devLog, devWarn, devError } from '../utils/devLog';
import apiClient from './api/client';
import socketService from './socketService';

const chatService = {
    // Initialize chat connection
    async initializeChat(userId) {
        try {
            // Try to connect socket
            await socketService.connect(userId);
            return true;
        } catch (error) {
            console.error('Failed to initialize chat:', error);
            return false;
        }
    },

    // Get room messages
    async getRoomMessages(roomId, options = {}) {

        try {
            const params = {
                limit: options.limit || 50,
                ...(options.before && { before: options.before }),
            };

            // Use correct endpoint structure with cache disabled for real-time messages
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
            }

            // Sort messages by createdAt to ensure correct order
            validMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            return validMessages;
        } catch (error) {
            devError('ChatService', 'Error fetching messages', error);

            return [];
        }
    },

    // Send message
    async sendMessage(roomId, content, type = 'text', attachments = []) {
        devLog('ChatService', '📤 Sending message', { roomId, content, type });
        
        // Always use API to ensure message is saved
        try {
            const response = await apiClient.post(`/chat/rooms/${roomId}/messages`, {
                content,
                type,
                attachments,
            });
            
            devLog('ChatService', '✅ Message sent via API', response);
            
            // Ensure response has proper structure
            const message = response.message || response;
            
            // Add roomId if not present
            if (!message.roomId && !message.room) {
                message.roomId = roomId;
            }
            
            // Note: The backend will emit the socket event to all room members
            // We don't need to emit here as it's handled server-side
            
            return message;
        } catch (error) {
            devError('ChatService', 'Error sending message', error);
            throw error;
        }
    },

    // Get chat rooms
    async getChatRooms() {

        try {
            const response = await apiClient.get('/chat/rooms', {
                cache: false // Disable caching for real-time room data
            });
            return response || [];
        } catch (error) {
            console.error('Error fetching chat rooms:', error);

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