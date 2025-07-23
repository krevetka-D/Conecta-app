// frontend/src/services/authService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

import apiClient from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import { devLog, devError } from '../utils';

const authService = {
    login: async (email, password) => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
                email,
                password,
            });

            // Handle both response.data and direct response formats
            const data = response.data || response;

            // Validate response structure
            if (!data || (!data.token && !data.accessToken)) {
                devError('AuthService', 'Invalid login response', data);
                throw new Error('Invalid response format from server');
            }

            // Normalize token field (handle both 'token' and 'accessToken')
            const token = data.token || data.accessToken;
            const user = data.user || data;

            return {
                token,
                user,
                ...data,
            };
        } catch (error) {
            devError('AuthService', 'Login service error', error);
            throw error;
        }
    },

    register: async (name, email, password, professionalPath = null) => {
        try {
            const payload = {
                name,
                email,
                password,
            };

            if (professionalPath) {
                payload.professionalPath = professionalPath;
            }

            devLog('AuthService', 'Register payload', payload);

            const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, payload);

            // The interceptor now returns response.data directly
            const data = response;

            devLog('AuthService', 'Register response data', data);

            // Validate response structure
            if (!data) {
                throw new Error('No response data from server');
            }

            // Backend might return user data directly without token for registration
            // Check multiple possible response formats

            // Format 1: { token, user }
            if (data.token && data.user) {
                return {
                    token: data.token,
                    user: data.user,
                };
            }

            // Format 2: { accessToken, user }
            if (data.accessToken && data.user) {
                return {
                    token: data.accessToken,
                    user: data.user,
                };
            }

            // Format 3: User object directly (need to login separately)
            if (data._id && data.email) {
                devLog('AuthService', 'Registration successful, but no token returned. User needs to login.');
                // Return user data without token - the auth context should handle this
                return {
                    token: null,
                    user: data,
                    requiresLogin: true,
                };
            }

            // Format 4: { success: true, data: { user } }
            if (data.success && data.data) {
                return {
                    token: data.data.token || null,
                    user: data.data.user || data.data,
                    requiresLogin: !data.data.token,
                };
            }

            // If we get here, the response format is unexpected
            devError('AuthService', 'Unexpected register response format', data);
            throw new Error(
                'Registration may have succeeded, but the response format was unexpected. Please try logging in.',
            );
        } catch (error) {
            devError('AuthService', 'Register service error', error);

            // The error has already been processed by the interceptor
            throw error;
        }
    },

    getToken: async () => {
        try {
            return await AsyncStorage.getItem('userToken');
        } catch (error) {
            devError('AuthService', 'Error getting token', error);
            return null;
        }
    },

    getCurrentUser: async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
            const data = response.data || response;

            if (!data || !data._id) {
                throw new Error('Invalid user data from server');
            }

            return data;
        } catch (error) {
            devError('AuthService', 'Get current user error', error);
            throw error;
        }
    },

    getMe: async () => {
        return authService.getCurrentUser();
    },

    updateOnboarding: async (professionalPath, pinnedModules) => {
        try {
            const response = await apiClient.put(API_ENDPOINTS.AUTH.UPDATE_ONBOARDING, {
                professionalPath,
                pinnedModules,
            });
            return response.data || response;
        } catch (error) {
            devError('AuthService', 'Update onboarding error', error);
            throw error;
        }
    },

    updateOnboardingPath: async (professionalPath) => {
        try {
            const response = await apiClient.put('/api/users/professional-path', {
                professionalPath,
            });
            return response.data || response;
        } catch (error) {
            devError('AuthService', 'Update onboarding path error', error);
            throw error;
        }
    },

    completeOnboarding: async (checklistItems) => {
        try {
            const response = await apiClient.put('/api/users/complete-onboarding', {
                selectedChecklistItems: checklistItems,
            });
            return response.data || response;
        } catch (error) {
            devError('AuthService', 'Complete onboarding error', error);
            throw error;
        }
    },

    updateProfile: async (profileData) => {
        try {
            const response = await apiClient.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, profileData);
            return response.data || response;
        } catch (error) {
            devError('AuthService', 'Update profile error', error);
            throw error;
        }
    },

    changePassword: async (currentPassword, newPassword) => {
        try {
            const response = await apiClient.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
                currentPassword,
                newPassword,
            });
            return response.data || response;
        } catch (error) {
            devError('AuthService', 'Change password error', error);
            throw error;
        }
    },

    logout: async () => {
        try {
            await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
            devError('AuthService', 'Logout API error', error);
            // Don't throw, continue with local logout
        }
    },

    setAuthToken: (token) => {
        if (token) {
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete apiClient.defaults.headers.common['Authorization'];
        }
    },
};

export default authService;
