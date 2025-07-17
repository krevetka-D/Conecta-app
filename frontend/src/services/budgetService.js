import apiClient from './api/client';
import { API_ENDPOINTS } from './api/endpoints';

const budgetService = {
    getBudgetEntries: async (filters = {}) => {
        const response = await apiClient.get(API_ENDPOINTS.BUDGET.LIST, {
            params: filters
        });
        return response.data;
    },

    createBudgetEntry: async (entry) => {
        const response = await apiClient.post(API_ENDPOINTS.BUDGET.CREATE, entry);
        return response.data;
    },

    updateBudgetEntry: async (id, entry) => {
        const response = await apiClient.put(API_ENDPOINTS.BUDGET.UPDATE(id), entry);
        return response.data;
    },

    deleteBudgetEntry: async (id) => {
        const response = await apiClient.delete(API_ENDPOINTS.BUDGET.DELETE(id));
        return response.data;
    },

    getBudgetSummary: async (period = 'month') => {
        const response = await apiClient.get(API_ENDPOINTS.BUDGET.SUMMARY, {
            params: { period }
        });
        return response.data;
    },

    /**
     * Fetches budget categories from the API.
     * @param {string} professionalPath - The user's professional path (e.g., 'FREELANCER').
     * @returns {Promise<Object>} An object containing arrays of income and expense categories.
     */
    getCategories: async (professionalPath) => {
        // Pass the professionalPath as a query parameter to the backend.
        const response = await apiClient.get('/config/categories', {
            params: { professionalPath }
        });
        return response.data;
    },

    exportBudgetData: async (format = 'csv', dateRange) => {
        const response = await apiClient.get(API_ENDPOINTS.BUDGET.EXPORT, {
            params: { format, ...dateRange },
            responseType: 'blob', // Important for file downloads
        });
        return response.data;
    },
};

export default budgetService;