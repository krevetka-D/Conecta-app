// frontend/src/services/messageService.js
import api from './api/client';
import endpoints from './api/endpoints';

const messageService = {
    getConversations: async () => {
        const response = await api.get(endpoints.MESSAGES.CONVERSATIONS);
        return response.data;
    },
    
    getMessages: async (conversationId) => {
        const response = await api.get(`${endpoints.MESSAGES.GET}/${conversationId}`);
        return response.data;
    },
    
    sendMessage: async (recipientId, content) => {
        const response = await api.post(endpoints.MESSAGES.SEND, {
            recipientId,
            content
        });
        return response.data;
    },
    
    markAsRead: async (conversationId) => {
        const response = await api.put(`${endpoints.MESSAGES.MARK_READ}/${conversationId}`);
        return response.data;
    }
};

export default messageService;