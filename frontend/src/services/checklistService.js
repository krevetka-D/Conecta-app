// frontend/src/services/checklistService.js
import apiClient from './api/client';
import { API_ENDPOINTS } from './api/endpoints';

const checklistService = {
    getChecklist: async () => {
        const response = await apiClient.get(API_ENDPOINTS.CHECKLIST.LIST);
        return response;
    },

    updateChecklistItem: async (itemKey, isCompleted) => {
        const response = await apiClient.put(API_ENDPOINTS.CHECKLIST.UPDATE(itemKey), { isCompleted });
        return response;
    },

    initializeChecklist: async (professionalPath) => {
        try {
            const response = await apiClient.post('/checklist/initialize', { 
                professionalPath 
            });
            return response;
        } catch (error) {
            console.error('Failed to initialize checklist:', error);
            throw error;
        }
    },

    selectChecklistItems: async (itemKeys) => {
        try {
            const response = await apiClient.post('/checklist/select', { 
                itemKeys 
            });
            return response;
        } catch (error) {
            console.error('Failed to select checklist items:', error);
            throw error;
        }
    },
};

export default checklistService;