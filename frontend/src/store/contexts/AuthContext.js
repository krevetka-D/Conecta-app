// frontend/src/store/contexts/AuthContext.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';

import apiClient from '../../services/api/client';
import authService from '../../services/authService';
import budgetService from '../../services/budgetService';
import checklistService from '../../services/checklistService';
import { devLog, devError, devWarn } from '../../utils';
import socketConnectionManager from '../../utils/socketConnectionManager';
import socketEventManager from '../../utils/socketEventManager';

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

    // Initialize pending checklist items
    const initializePendingChecklist = useCallback(async () => {
        try {
            const pendingItems = await AsyncStorage.getItem('pendingChecklistItems');
            if (pendingItems && user) {
                const items = JSON.parse(pendingItems);
                if (items.length > 0) {
                    try {
                        // Initialize checklist items in backend
                        await checklistService.initializeChecklist(items);
                        // Clear pending items after successful initialization
                        await AsyncStorage.removeItem('pendingChecklistItems');
                        devLog('AuthContext', 'Checklist initialized with items', items);
                    } catch (error) {
                        // Don't throw - just log the error
                        devWarn('AuthContext', 'Checklist initialization deferred', error.message);
                        // Keep the pending items for later retry
                    }
                }
            }
        } catch (error) {
            devWarn('AuthContext', 'Failed to process pending checklist', error);
            // Don't throw - this is not critical for app functionality
        }
    }, [user]);

    // Load user from storage on mount
    useEffect(() => {
        const loadUserFromStorage = async () => {
            try {
                const [storedToken, storedUserStr] = await AsyncStorage.multiGet([
                    'userToken',
                    'user',
                ]);
                const tokenValue = storedToken[1];
                const userValue = storedUserStr[1];

                if (tokenValue && userValue) {
                    // Set the token in the API client first
                    authService.setAuthToken(tokenValue);
                    if (apiClient.defaults && apiClient.defaults.headers) {
                        apiClient.defaults.headers.common['Authorization'] = `Bearer ${tokenValue}`;
                    }

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
                                // Start monitoring socket connection - this will handle the connection
                                socketConnectionManager.startMonitoring(currentUser._id)
                                    .then(() => {
                                        devLog('AuthContext', 'Socket connection manager initialized');
                                        // Initialize socket event manager after connection manager is ready
                                        socketEventManager.initialize();
                                    })
                                    .catch((err) => {
                                        devLog('AuthContext', 'Socket connection manager failed, continuing without realtime');
                                        // Still initialize event manager for later connection attempts
                                        socketEventManager.initialize();
                                    });
                            }
                        } else {
                            throw new Error('Invalid user data');
                        }
                    } catch (verifyError) {
                        devLog('AuthContext', 'Token verification failed, clearing auth data');
                        await clearAuthData();
                    }
                } else {
                    devLog('AuthContext', 'No stored auth data found');
                }
            } catch (error) {
                devError('AuthContext', 'Failed to load user data from storage', error);
                await clearAuthData();
            } finally {
                setLoading(false);
            }
        };

        loadUserFromStorage();
    }, []);

    // Initialize pending checklist when user is set
    useEffect(() => {
        if (user && user._id) {
            // Initialize any pending checklist items
            initializePendingChecklist();
        }
    }, [user, initializePendingChecklist]);

    const clearAuthData = async () => {
        try {
            setUser(null);
            setToken(null);
            await AsyncStorage.multiRemove(['userToken', 'user']);
            authService.setAuthToken(null);
            if (apiClient.defaults && apiClient.defaults.headers) {
                delete apiClient.defaults.headers.common['Authorization'];
            }
            budgetService.clearCategoriesCache();
            socketEventManager.cleanup();
            socketConnectionManager.stopMonitoring();
            apiClient.clearAllCache();
        } catch (error) {
            devError('AuthContext', 'Error clearing auth data', error);
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
            if (apiClient.defaults && apiClient.defaults.headers) {
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            }

            setUser(data.user);
            setToken(data.token);

            await AsyncStorage.multiSet([
                ['userToken', data.token],
                ['user', JSON.stringify(data.user)],
            ]);

            // Connect socket service
            if (data.user._id) {
                // Start monitoring socket connection - this will handle the connection
                socketConnectionManager.startMonitoring(data.user._id)
                    .then(() => {
                        devLog('AuthContext', 'Socket connection manager initialized after login');
                        // Initialize socket event manager after connection manager is ready
                        socketEventManager.initialize();
                    })
                    .catch((err) => {
                        devLog('AuthContext', 'Socket connection manager failed, continuing without realtime');
                        // Still initialize event manager for later connection attempts
                        socketEventManager.initialize();
                    });
            }

            // Initialize pending checklist items after successful login
            const pendingItems = await AsyncStorage.getItem('pendingChecklistItems');
            if (pendingItems) {
                const items = JSON.parse(pendingItems);
                if (items.length > 0) {
                    try {
                        await checklistService.initializeChecklist(items);
                        await AsyncStorage.removeItem('pendingChecklistItems');
                        devLog('AuthContext', 'Checklist initialized after login with items', items);
                    } catch (error) {
                        devError('AuthContext', 'Failed to initialize checklist after login', error);
                    }
                }
            }

            return data;
        } catch (error) {
            devError('AuthContext', 'Login failed', error);
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
                devLog('AuthContext', 'Registration successful, but login required');
                // Clear any existing auth data
                await clearAuthData();

                // Return success with a flag indicating login is needed
                return {
                    success: true,
                    requiresLogin: true,
                    user: data.user,
                    message: 'Registration successful. Please login to continue.',
                };
            }

            if (!data.token || !data.user) {
                throw new Error('Invalid response from server');
            }

            // Set token in API client immediately
            authService.setAuthToken(data.token);
            if (apiClient.defaults && apiClient.defaults.headers) {
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            }

            // Update user with onboarding status
            const updatedUser = {
                ...data.user,
                onboardingStep: professionalPath ? 'CHECKLIST_SELECTION' : 'PATH_SELECTION',
            };

            setUser(updatedUser);
            setToken(data.token);

            await AsyncStorage.multiSet([
                ['userToken', data.token],
                ['user', JSON.stringify(updatedUser)],
            ]);

            // Connect socket service
            if (data.user._id) {
                socketConnectionManager.startMonitoring(data.user._id)
                    .then(() => {
                        devLog('AuthContext', 'Socket connection manager initialized after registration');
                        // Initialize socket event manager after connection manager is ready
                        socketEventManager.initialize();
                    })
                    .catch((err) => {
                        devLog('AuthContext', 'Socket connection manager failed, continuing without realtime features');
                        // Still initialize event manager for later connection attempts
                        socketEventManager.initialize();
                    });
            }

            // If we have a token, try to initialize checklist immediately
            const pendingItems = await AsyncStorage.getItem('pendingChecklistItems');
            if (pendingItems && data.token) {
                const items = JSON.parse(pendingItems);
                if (items.length > 0) {
                    try {
                        await checklistService.initializeChecklist(items);
                        await AsyncStorage.removeItem('pendingChecklistItems');
                        devLog('AuthContext', 'Checklist initialized immediately after registration');
                    } catch (error) {
                        devError('AuthContext', 'Failed to initialize checklist after registration', error);
                        // Don't throw - allow registration to complete
                    }
                }
            }

            return data;
        } catch (error) {
            devError('AuthContext', 'Registration failed', error);
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
                    devWarn('AuthContext', 'Logout API call failed', error);
                }
            }

            await clearAuthData();
        } catch (error) {
            devError('AuthContext', 'Logout failed', error);
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
            devError('AuthContext', 'Token refresh failed', error);
            // If refresh fails, clear auth and redirect to login
            await clearAuthData();
            return false;
        } finally {
            setIsRefreshing(false);
        }
    }, [token, isRefreshing]);

    const updateOnboardingPath = useCallback(
        async (professionalPath) => {
            try {
                if (!user) {
                    throw new Error('No user found');
                }

                const response = await authService.updateOnboardingPath(professionalPath);
                const updatedUser = {
                    ...user,
                    professionalPath,
                    onboardingStep: response.onboardingStep || 'CHECKLIST_SELECTION',
                };

                setUser(updatedUser);
                await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

                // Clear categories cache when professional path changes
                budgetService.clearCategoriesCache();
            } catch (error) {
                devError('AuthContext', 'Failed to update onboarding path', error);
                throw error;
            }
        },
        [user],
    );

    const completeOnboarding = useCallback(
        async (checklistItems = []) => {
            try {
                setIsRefreshing(true);

                // Complete onboarding with selected checklist items
                const response = await authService.completeOnboarding(checklistItems);

                const updatedUser = {
                    ...user,
                    ...response,
                    onboardingStep: 'COMPLETED',
                    hasCompletedOnboarding: true,
                };

                setUser(updatedUser);
                await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

                return updatedUser;
            } catch (error) {
                devError('AuthContext', 'Failed to complete onboarding', error);
                throw error;
            } finally {
                setIsRefreshing(false);
            }
        },
        [user],
    );

    const updateUser = useCallback(
        async (userData) => {
            try {
                const updatedUser = { ...user, ...userData };
                setUser(updatedUser);
                await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

                // Clear categories cache if professional path changed
                if (
                    userData.professionalPath &&
                    userData.professionalPath !== user?.professionalPath
                ) {
                    budgetService.clearCategoriesCache();
                }
            } catch (error) {
                devError('AuthContext', 'Failed to update user', error);
                throw error;
            }
        },
        [user],
    );

    // Update user online status
    const updateOnlineStatus = useCallback(
        async (isOnline) => {
            try {
                if (user) {
                    // Use realtimeService through socketConnectionManager
                    const realtimeService = require('../../services/realtimeService').default;
                    realtimeService.emit('update_status', { isOnline });
                }
            } catch (error) {
                devError('AuthContext', 'Failed to update online status', error);
            }
        },
        [user],
    );

    // Memoize the context value to prevent unnecessary re-renders
    const value = useMemo(
        () => ({
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
            isOnboardingCompleted:
                user?.onboardingStep === 'COMPLETED' || user?.hasCompletedOnboarding || false,
        }),
        [
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
        ],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
