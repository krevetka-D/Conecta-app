// frontend/src/services/personalChatService.js
import apiClient from './api/client';
import socketService from './socketService';

const personalChatService = {
    // Get all conversations
    async getConversations() {
        try {
            const response = await apiClient.get('/messages/conversations');
            return response || [];
        } catch (error) {
            console.error('Error fetching conversations:', error);
            return [];
        }
    },

    // Get messages for a specific conversation
    async getMessages(userId, limit = 50, before = null) {
        try {
            const params = {
                userId,
                limit,
                ...(before && { before }),
            };
            const response = await apiClient.get('/messages', { params });
            return response || [];
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    },

    // Send a personal message
    async sendMessage(recipientId, content, type = 'text') {
        // Always send via API to ensure persistence
        try {
            const response = await apiClient.post('/messages', {
                recipientId,
                content,
                type,
            });
            
            // Also emit via socket for real-time delivery if connected
            if (socketService.isConnected()) {
                socketService.sendPersonalMessage({
                    recipientId,
                    content,
                    type,
                    messageId: response._id, // Include the saved message ID
                });
            }
            
            return response;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    // Mark messages as read
    async markAsRead(conversationId) {
        try {
            const response = await apiClient.post('/messages/read', {
                conversationId,
            });
            return response;
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    },

    // Start a new conversation
    async startConversation(userId) {
        try {
            // This creates or retrieves an existing conversation
            const response = await apiClient.post('/messages/conversations', {
                userId,
            });
            return response;
        } catch (error) {
            console.error('Error starting conversation:', error);
            throw error;
        }
    },

    // Delete a conversation
    async deleteConversation(conversationId) {
        try {
            const response = await apiClient.delete(`/messages/conversations/${conversationId}`);
            return response;
        } catch (error) {
            console.error('Error deleting conversation:', error);
            throw error;
        }
    },

    // Get user profile
    async getUserProfile(userId) {
        try {
            // Changed from /users/${userId}/profile to /messages/users/${userId}/profile
            const response = await apiClient.get(`/messages/users/${userId}/profile`);
            return response;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    },

    // Block/unblock user
    async toggleBlockUser(userId, block = true) {
        try {
            // Changed from /users/${userId}/block to /messages/users/${userId}/block
            const endpoint = block
                ? `/messages/users/${userId}/block`
                : `/messages/users/${userId}/unblock`;
            const response = await apiClient.post(endpoint);
            return response;
        } catch (error) {
            console.error('Error toggling block status:', error);
            throw error;
        }
    },
};

export default personalChatService;
