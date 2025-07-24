// frontend/src/services/checklistService.js
import apiClient from './api/client';
import { API_ENDPOINTS } from './api/endpoints';

const checklistService = {
    getChecklist: async (forceRefresh = false) => {
        try {
            const config = forceRefresh ? { cache: false } : { cacheTTL: 30000 }; // 30 seconds cache
            const response = await apiClient.get(API_ENDPOINTS.CHECKLIST.LIST, config);
            // Ensure we always return an array
            return Array.isArray(response) ? response : response?.items || [];
        } catch (error) {
            console.error('Failed to get checklist:', error);
            // Return empty array on error instead of throwing
            return [];
        }
    },

    updateChecklistItem: async (itemKey, isCompleted) => {
        const response = await apiClient.put(API_ENDPOINTS.CHECKLIST.UPDATE(itemKey), {
            isCompleted,
        });
        // Clear checklist cache after update
        apiClient.clearCache('/checklist');
        return response;
    },

    initializeChecklist: async (selectedItems) => {
        try {
            // Ensure selectedItems is an array
            if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
                console.warn('No checklist items to initialize');
                return { success: true, items: [] };
            }

            const response = await apiClient.post('/checklist/initialize', {
                selectedItems,
            });

            return response || { success: true };
        } catch (error) {
            console.error('Failed to initialize checklist:', error);
            // Don't throw - return a success response to allow registration to continue
            return { success: true, message: 'Checklist will be initialized later' };
        }
    },
};

export default checklistService;
