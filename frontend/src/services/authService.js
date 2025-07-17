// src/services/authService.js
import apiClient, { setAuthToken } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';

const authService = {
    login: async (email, password) => {
        const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
            email,
            password
        });
        return response;
    },

    register: async (name, email, password, professionalPath = null) => {
        const payload = {
            name,
            email,
            password
        };
        
        // Only include professionalPath if it's provided
        if (professionalPath) {
            payload.professionalPath = professionalPath;
        }
        
        const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, payload);
        return response;
    },

    getMe: async () => {
        const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
        return response;
    },

    updateOnboarding: async (professionalPath, pinnedModules) => {
        const response = await apiClient.put(API_ENDPOINTS.AUTH.UPDATE_ONBOARDING, {
            professionalPath,
            pinnedModules,
        });
        return response;
    },

    updateProfile: async (profileData) => {
        const response = await apiClient.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, profileData);
        return response;
    },

    changePassword: async (currentPassword, newPassword) => {
        const response = await apiClient.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
            currentPassword,
            newPassword,
        });
        return response;
    },

    logout: async () => {
        try {
            await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
            // Continue with logout even if API call fails
            console.error('Logout API error:', error);
        }
    },

    setAuthToken,
};

export default authService;