// frontend/src/store/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../../services/authService';
import budgetService from '../../services/budgetService';
import apiClient from '../../services/api/client';
import socketService from '../../services/socketService';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Load user from storage on mount
    useEffect(() => {
        const loadUserFromStorage = async () => {
            try {
                const [storedToken, storedUserStr] = await AsyncStorage.multiGet(['userToken', 'user']);
                const tokenValue = storedToken[1];
                const userValue = storedUserStr[1];

                if (tokenValue && userValue) {
                    // Set the token in the API client first
                    authService.setAuthToken(tokenValue);
                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${tokenValue}`;
                    
                    // Verify token is still valid by fetching current user
                    try {
                        const currentUser = await authService.getCurrentUser();
                        if (currentUser) {
                            setToken(tokenValue);
                            setUser(currentUser);
                            // Update stored user data with fresh data
                            await AsyncStorage.setItem('user', JSON.stringify(currentUser));
                            
                            // Connect socket service if user is authenticated
                            if (currentUser._id) {
                                socketService.connect(currentUser._id).catch(err => {
                                    console.log('Socket connection failed, continuing without realtime features');
                                });
                            }
                        } else {
                            throw new Error('Invalid user data');
                        }
                    } catch (verifyError) {
                        console.log('Token verification failed, clearing auth data');
                        await clearAuthData();
                    }
                } else {
                    console.log('No stored auth data found');
                }
            } catch (error) {
                console.error('Failed to load user data from storage', error);
                await clearAuthData();
            } finally {
                setLoading(false);
            }
        };

        loadUserFromStorage();
    }, []);

    const clearAuthData = async () => {
        try {
            setUser(null);
            setToken(null);
            await AsyncStorage.multiRemove(['userToken', 'user']);
            authService.setAuthToken(null);
            delete apiClient.defaults.headers.common['Authorization'];
            budgetService.clearCategoriesCache();
            socketService.disconnect();
        } catch (error) {
            console.error('Error clearing auth data:', error);
        }
    };

    const login = useCallback(async (email, password) => {
        try {
            setIsRefreshing(true);
            const data = await authService.login(email, password);

            if (!data.token || !data.user) {
                throw new Error('Invalid response from server');
            }

            // Set token in API client immediately
            authService.setAuthToken(data.token);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

            setUser(data.user);
            setToken(data.token);

            await AsyncStorage.multiSet([
                ['userToken', data.token],
                ['user', JSON.stringify(data.user)]
            ]);

            // Connect socket service
            if (data.user._id) {
                socketService.connect(data.user._id).catch(err => {
                    console.log('Socket connection failed, continuing without realtime features');
                });
            }

            return data;
        } catch (error) {
            console.error('Login failed:', error);
            // Clear any partial auth data on login failure
            await clearAuthData();
            throw error;
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    const register = useCallback(async (name, email, password, professionalPath = null) => {
        try {
            setIsRefreshing(true);
            const data = await authService.register(name, email, password, professionalPath);

            // Check if registration requires login (no token returned)
            if (data.requiresLogin) {
                console.log('Registration successful, but login required');
                // Clear any existing auth data
                await clearAuthData();
                
                // Return success with a flag indicating login is needed
                return {
                    success: true,
                    requiresLogin: true,
                    user: data.user,
                    message: 'Registration successful. Please login to continue.'
                };
            }

            if (!data.token || !data.user) {
                throw new Error('Invalid response from server');
            }

            // Set token in API client immediately
            authService.setAuthToken(data.token);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

            // Update user with onboarding status
            const updatedUser = {
                ...data.user,
                onboardingStep: professionalPath ? 'CHECKLIST_SELECTION' : 'PATH_SELECTION'
            };

            setUser(updatedUser);
            setToken(data.token);

            await AsyncStorage.multiSet([
                ['userToken', data.token],
                ['user', JSON.stringify(updatedUser)]
            ]);

            // Connect socket service
            if (data.user._id) {
                socketService.connect(data.user._id).catch(err => {
                    console.log('Socket connection failed, continuing without realtime features');
                });
            }

            return data;
        } catch (error) {
            console.error('Registration failed:', error);
            // Clear any partial auth data on registration failure
            await clearAuthData();
            throw error;
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            setIsRefreshing(true);
            // Call logout API if available
            if (token) {
                try {
                    await authService.logout();
                } catch (error) {
                    console.warn('Logout API call failed:', error);
                }
            }

            await clearAuthData();
        } catch (error) {
            console.error('Logout failed:', error);
            // Still clear local state even if API call fails
            await clearAuthData();
        } finally {
            setIsRefreshing(false);
        }
    }, [token]);

    const refreshToken = useCallback(async () => {
        if (!token || isRefreshing) return;

        try {
            setIsRefreshing(true);
            // Verify current token is still valid
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                await AsyncStorage.setItem('user', JSON.stringify(currentUser));
                return true;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            // If refresh fails, clear auth and redirect to login
            await clearAuthData();
            return false;
        } finally {
            setIsRefreshing(false);
        }
    }, [token, isRefreshing]);

    const updateOnboardingPath = useCallback(async (professionalPath) => {
        try {
            if (!user) {
                throw new Error('No user found');
            }

            const response = await authService.updateOnboardingPath(professionalPath);
            const updatedUser = { 
                ...user, 
                professionalPath,
                onboardingStep: response.onboardingStep || 'CHECKLIST_SELECTION'
            };
            
            setUser(updatedUser);
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Clear categories cache when professional path changes
            budgetService.clearCategoriesCache();
        } catch (error) {
            console.error('Failed to update onboarding path:', error);
            throw error;
        }
    }, [user]);

    const completeOnboarding = useCallback(async (checklistItems = []) => {
        try {
            setIsRefreshing(true);
            
            // Complete onboarding with selected checklist items
            const response = await authService.completeOnboarding(checklistItems);
            
            const updatedUser = {
                ...user,
                ...response,
                onboardingStep: 'COMPLETED',
                hasCompletedOnboarding: true
            };

            setUser(updatedUser);
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

            return updatedUser;
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
            throw error;
        } finally {
            setIsRefreshing(false);
        }
    }, [user]);

    const updateUser = useCallback(async (userData) => {
        try {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Clear categories cache if professional path changed
            if (userData.professionalPath && userData.professionalPath !== user?.professionalPath) {
                budgetService.clearCategoriesCache();
            }
        } catch (error) {
            console.error('Failed to update user:', error);
            throw error;
        }
    }, [user]);

    // Update user online status
    const updateOnlineStatus = useCallback(async (isOnline) => {
        try {
            if (user && socketService.isConnected()) {
                socketService.emit('update_status', { isOnline });
            }
        } catch (error) {
            console.error('Failed to update online status:', error);
        }
    }, [user]);

    // Memoize the context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        user,
        token,
        loading,
        isRefreshing,
        login,
        register,
        logout,
        updateOnboardingPath,
        completeOnboarding,
        updateUser,
        updateOnlineStatus,
        refreshToken,
        isAuthenticated: !!user && !!token,
        isOnboardingCompleted: user?.onboardingStep === 'COMPLETED' || user?.hasCompletedOnboarding || false,
    }), [user, token, loading, isRefreshing, login, register, logout, updateOnboardingPath, completeOnboarding, updateUser, updateOnlineStatus, refreshToken]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};