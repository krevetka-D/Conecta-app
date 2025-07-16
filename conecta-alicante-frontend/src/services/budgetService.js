import api from './api';

const budgetService = {
    getBudgetEntries: async () => {
        const response = await api.get('/budget');
        return response;
    },

    createBudgetEntry: async (entry) => {
        const response = await api.post('/budget', entry);
        return response;
    },

    deleteBudgetEntry: async (id) => {
        const response = await api.delete(`/budget/${id}`);
        return response;
    },
};

export default budgetService;