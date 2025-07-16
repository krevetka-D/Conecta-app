// src/services/budgetService.js
import apiClient from './api/client';
import { API_ENDPOINTS } from './api/endpoints';

const budgetService = {
    getBudgetEntries: async (filters = {}) => {
        const response = await apiClient.get(API_ENDPOINTS.BUDGET.LIST, {
            params: filters
        });
        return response;
    },

    createBudgetEntry: async (entry) => {
        const response = await apiClient.post(API_ENDPOINTS.BUDGET.CREATE, entry);
        return response;
    },

    updateBudgetEntry: async (id, entry) => {
        const response = await apiClient.put(API_ENDPOINTS.BUDGET.UPDATE(id), entry);
        return response;
    },

    deleteBudgetEntry: async (id) => {
        const response = await apiClient.delete(API_ENDPOINTS.BUDGET.DELETE(id));
        return response;
    },

    getBudgetSummary: async (period = 'month') => {
        const response = await apiClient.get(API_ENDPOINTS.BUDGET.SUMMARY, {
            params: { period }
        });
        return response;
    },

    exportBudgetData: async (format = 'csv', dateRange) => {
        const response = await apiClient.get(API_ENDPOINTS.BUDGET.EXPORT, {
            params: { format, ...dateRange },
            responseType: 'blob',
        });
        return response;
    },
};

export default budgetService;