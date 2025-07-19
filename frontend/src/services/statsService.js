
import api from './api/client';
import endpoints from './api/endpoints';

const statsService = {
    getUserStats: async (userId) => {
        const response = await api.get(`${endpoints.STATS.USER}/${userId}`);
        return response.data;
    },
    
    getDashboardStats: async () => {
        const response = await api.get(endpoints.STATS.DASHBOARD);
        return response.data;
    }
};

export default statsService;