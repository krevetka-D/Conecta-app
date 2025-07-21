// frontend/src/services/authService.js
import apiClient, { setAuthToken } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';

const authService = {
    login: async (email, password) => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
                email,
                password
            });
            
            // Handle both response.data and direct response formats
            const data = response.data || response;
            
            // Validate response structure
            if (!data || (!data.token && !data.accessToken)) {
                console.error('Invalid login response:', data);
                throw new Error('Invalid response format from server');
            }
            
            // Normalize token field (handle both 'token' and 'accessToken')
            const token = data.token || data.accessToken;
            const user = data.user || data;
            
            return {
                token,
                user,
                ...data
            };
        } catch (error) {
            console.error('Login service error:', error);
            throw error;
        }
    },

    register: async (name, email, password, professionalPath = null) => {
        try {
            const payload = {
                name,
                email,
                password
            };
            
            if (professionalPath) {
                payload.professionalPath = professionalPath;
            }
            
            console.log('Register payload:', payload);
            
            const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, payload);
            
            // The interceptor now returns the full response object
            const data = response.data;
            
            console.log('Register response data:', data);
            console.log('Register response status:', response.status);
            
            // Validate response structure
            if (!data) {
                throw new Error('No response data from server');
            }
            
            // Backend might return user data directly without token for registration
            // Check multiple possible response formats
            if (response.status === 201 || response.status === 200) {
                // Success - but structure might vary
                
                // Format 1: { token, user }
                if (data.token && data.user) {
                    return {
                        token: data.token,
                        user: data.user
                    };
                }
                
                // Format 2: { accessToken, user }
                if (data.accessToken && data.user) {
                    return {
                        token: data.accessToken,
                        user: data.user
                    };
                }
                
                // Format 3: User object directly (need to login separately)
                if (data._id && data.email) {
                    console.log('Registration successful, but no token returned. User needs to login.');
                    // Return user data without token - the auth context should handle this
                    return {
                        token: null,
                        user: data,
                        requiresLogin: true
                    };
                }
                
                // Format 4: { success: true, data: { user } }
                if (data.success && data.data) {
                    return {
                        token: data.data.token || null,
                        user: data.data.user || data.data,
                        requiresLogin: !data.data.token
                    };
                }
            }
            
            // If we get here, the response format is unexpected
            console.error('Unexpected register response format:', data);
            throw new Error('Registration may have succeeded, but the response format was unexpected. Please try logging in.');
            
        } catch (error) {
            console.error('Register service error:', error);
            
            // The error has already been processed by the interceptor
            throw error;
        }
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
        try {
            const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
            const data = response.data || response;
            
            if (!data || !data._id) {
                throw new Error('Invalid user data from server');
            }
            
            return data;
        } catch (error) {
            console.error('Get current user error:', error);
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
            console.error('Update onboarding error:', error);
            throw error;
        }
    },

    updateOnboardingPath: async (professionalPath) => {
        try {
            const response = await apiClient.put('/api/users/professional-path', {
                professionalPath
            });
            return response.data || response;
        } catch (error) {
            console.error('Update onboarding path error:', error);
            throw error;
        }
    },

    completeOnboarding: async (checklistItems) => {
        try {
            const response = await apiClient.put('/api/users/complete-onboarding', {
                selectedChecklistItems: checklistItems
            });
            return response.data || response;
        } catch (error) {
            console.error('Complete onboarding error:', error);
            throw error;
        }
    },

    updateProfile: async (profileData) => {
        try {
            const response = await apiClient.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, profileData);
            return response.data || response;
        } catch (error) {
            console.error('Update profile error:', error);
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
            console.error('Change password error:', error);
            throw error;
        }
    },

    logout: async () => {
        try {
            await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
            console.error('Logout API error:', error);
            // Don't throw, continue with local logout
        }
    },

    setAuthToken,
};

export default authService;