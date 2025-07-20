import apiClient from './api/client';

const chatService = {
    getChatRooms: async () => {
        try {
            const response = await apiClient.get('/chat/rooms');
            return response;
        } catch (error) {
            console.error('Error fetching chat rooms:', error);
            throw error;
        }
    },

    getRoomMessages: async (roomId, options = {}) => {
        try {
            const response = await apiClient.get(`/chat/rooms/${roomId}/messages`, {
                params: options
            });
            return response;
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    },

    searchMessages: async (query, roomId = null) => {
        try {
            const response = await apiClient.get('/chat/search', {
                params: { q: query, roomId }
            });
            return response;
        } catch (error) {
            console.error('Error searching messages:', error);
            throw error;
        }
    },

    markMessagesAsRead: async (roomId) => {
        try {
            const response = await apiClient.post(`/chat/rooms/${roomId}/read`);
            return response;
        } catch (error) {
            console.error('Error marking messages as read:', error);
            throw error;
        }
    }
};

export default chatService;