import api from './api';

const checklistService = {
    getChecklist: async () => {
        const response = await api.get('/checklist');
        return response;
    },

    updateChecklistItem: async (itemKey, isCompleted) => {
        const response = await api.put(`/checklist/${itemKey}`, { isCompleted });
        return response;
    },
};

export default checklistService;