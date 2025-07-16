import api, { setAuthToken } from './api';

const authService = {
    login: async (email, password) => {
        const response = await api.post('/users/login', { email, password });
        return response;
    },

    register: async (name, email, password) => {
        const response = await api.post('/users', { name, email, password });
        return response;
    },

    getMe: async () => {
        const response = await api.get('/users/me');
        return response;
    },

    updateOnboarding: async (professionalPath, pinnedModules) => {
        const response = await api.put('/users/onboarding', {
            professionalPath,
            pinnedModules,
        });
        return response;
    },

    setAuthToken,
};

export default authService;