
import apiClient from './api/client';
import { API_ENDPOINTS } from './api/endpoints';

// Cache for categories to avoid repeated API calls
let categoriesCache = new Map(); // professionalPath -> categories
let cacheTimestamp = new Map(); // professionalPath -> timestamp
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for budget entries
let entriesCache = null;
let entriesCacheTimestamp = null;

const budgetService = {
    getBudgetEntries: async (filters = {}) => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.BUDGET.LIST, {
                params: filters
            });
            // Ensure we always return an array
            return Array.isArray(response) ? response : response?.entries || [];
        } catch (error) {
            console.error('Error fetching budget entries:', error);
            throw error;
        }
    },

    createBudgetEntry: async (entry) => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.BUDGET.CREATE, entry);
            return response;
        } catch (error) {
            console.error('Error creating budget entry:', error);
            throw error;
        }
    },

    updateBudgetEntry: async (id, entry) => {
        try {
            const response = await apiClient.put(API_ENDPOINTS.BUDGET.UPDATE(id), entry);
            return response;
        } catch (error) {
            console.error('Error updating budget entry:', error);
            throw error;
        }
    },

    deleteBudgetEntry: async (id) => {
        try {
            const response = await apiClient.delete(API_ENDPOINTS.BUDGET.DELETE(id));
            return response;
        } catch (error) {
            console.error('Error deleting budget entry:', error);
            throw error;
        }
    },

    getBudgetSummary: async (period = 'month') => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.BUDGET.SUMMARY, {
                params: { period }
            });
            return response;
        } catch (error) {
            console.error('Error fetching budget summary:', error);
            throw error;
        }
    },

 /**
     * Fetches budget categories with caching
     */
    getCategories: async (professionalPath) => {
        const cacheKey = professionalPath || 'default';
        
        // Check if we have valid cached data
        if (categoriesCache.has(cacheKey) && 
            cacheTimestamp.has(cacheKey) && 
            (Date.now() - cacheTimestamp.get(cacheKey) < CACHE_DURATION)) {
            return categoriesCache.get(cacheKey);
        }

        try {
            const response = await apiClient.get('/config/categories', {
                params: professionalPath ? { professionalPath } : {}
            });
            
            // Update cache
            categoriesCache.set(cacheKey, response);
            cacheTimestamp.set(cacheKey, Date.now());
            
            return response;
        } catch (error) {
            console.error('Failed to fetch categories from API:', error);

            // Return cached data if available, even if expired
            if (categoriesCache.has(cacheKey)) {
                return categoriesCache.get(cacheKey);
            }

            // Return default categories as fallback
            const defaultCategories = professionalPath === 'ENTREPRENEUR'
                ? {
                    income: ['Product Sales', 'Service Revenue', 'Investor Funding', 'Grants', 'Other Income'],
                    expense: ['Salaries & Payroll', 'Office Rent', 'Legal & Accounting', 'Marketing & Sales', 'R&D', 'Operations', 'Other Expenses']
                }
                : {
                    income: ['Project-Based Income', 'Recurring Clients', 'Passive Income', 'Other Income'],
                    expense: ['Cuota de Autónomo', 'Office/Coworking', 'Software & Tools', 'Professional Services', 'Marketing', 'Travel & Transport', 'Other Expenses']
                };

            return defaultCategories;
        }
    },

 // Clear categories cache when user changes professional path
    clearCategoriesCache: () => {
        categoriesCache.clear();
        cacheTimestamp.clear();
        entriesCache = null;
        entriesCacheTimestamp = null;
    },

    exportBudgetData: async (format = 'csv', dateRange) => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.BUDGET.EXPORT, {
                params: { format, ...dateRange },
                responseType: 'blob',
            });
            return response;
        } catch (error) {
            console.error('Error exporting budget data:', error);
            throw error;
        }
    },
};

export default budgetService;