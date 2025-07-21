// frontend/src/services/authService.js
import apiClient, { setAuthToken } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        
        if (professionalPath) {
            payload.professionalPath = professionalPath;
        }
        
        const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, payload);
        return response;
    },

    getToken: async () => {
        try {
            return await AsyncStorage.getItem('userToken');
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    },

    getCurrentUser: async () => {
        const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
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

    updateOnboardingPath: async (professionalPath) => {
        const response = await apiClient.put('/api/users/professional-path', {
            professionalPath
        });
        return response;
    },

    completeOnboarding: async (checklistItems) => {
        const response = await apiClient.put('/api/users/complete-onboarding', {
            selectedChecklistItems: checklistItems
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
            console.error('Logout API error:', error);
        }
    },

    setAuthToken,
};

export default authService;