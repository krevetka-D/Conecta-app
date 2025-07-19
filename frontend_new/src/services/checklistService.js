
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
};

export default checklistService;