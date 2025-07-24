import apiClient from './api/client';
import { API_ENDPOINTS } from './api/endpoints';

const userService = {
    getMe: async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.USER.ME);
            return response;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    },

    updateProfile: async (profileData) => {
        try {
            const response = await apiClient.put(API_ENDPOINTS.USER.UPDATE_PROFILE, profileData);
            return response;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    },

    getPublicProfile: async (userId) => {
        try {
            const response = await apiClient.get(`/users/profile/${userId}`);
            return response;
        } catch (error) {
            console.error('Error fetching public profile:', error);
            throw error;
        }
    },

    updateProfessionalPath: async (professionalPath) => {
        try {
            const response = await apiClient.put(API_ENDPOINTS.USER.UPDATE_PATH, {
                professionalPath
            });
            return response;
        } catch (error) {
            console.error('Error updating professional path:', error);
            throw error;
        }
    },

    completeOnboarding: async () => {
        try {
            const response = await apiClient.put(API_ENDPOINTS.USER.COMPLETE_ONBOARDING);
            return response;
        } catch (error) {
            console.error('Error completing onboarding:', error);
            throw error;
        }
    },

    getOnboardingStatus: async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.USER.ONBOARDING_STATUS);
            return response;
        } catch (error) {
            console.error('Error fetching onboarding status:', error);
            throw error;
        }
    },
};

export default userService;