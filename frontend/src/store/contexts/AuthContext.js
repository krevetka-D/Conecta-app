// frontend/src/store/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../../services/authService';
import budgetService from '../../services/budgetService';

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

    // Load user from storage on mount
    useEffect(() => {
        const loadUserFromStorage = async () => {
            try {
                const [storedToken, storedUserStr] = await AsyncStorage.multiGet(['userToken', 'user']);
                const tokenValue = storedToken[1];
                const userValue = storedUserStr[1];

                if (tokenValue && userValue) {
                    setToken(tokenValue);
                    const userData = JSON.parse(userValue);
                    setUser(userData);
                    authService.setAuthToken(tokenValue);
                }
            } catch (error) {
                console.error('Failed to load user data from storage', error);
                // Clear potentially corrupted data
                await AsyncStorage.multiRemove(['userToken', 'user']);
            } finally {
                setLoading(false);
            }
        };

        loadUserFromStorage();
    }, []);

    const login = useCallback(async (email, password) => {
        try {
            const data = await authService.login(email, password);

            if (!data.token || !data.user) {
                throw new Error('Invalid response from server');
            }

            setUser(data.user);
            setToken(data.token);

            await AsyncStorage.multiSet([
                ['userToken', data.token],
                ['user', JSON.stringify(data.user)]
            ]);
            authService.setAuthToken(data.token);

            return data;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }, []);

    const register = useCallback(async (name, email, password, professionalPath = null) => {
        try {
            const data = await authService.register(name, email, password, professionalPath);

            if (!data.token || !data.user) {
                throw new Error('Invalid response from server');
            }

            setUser(data.user);
            setToken(data.token);

            await AsyncStorage.multiSet([
                ['userToken', data.token],
                ['user', JSON.stringify(data.user)]
            ]);
            authService.setAuthToken(data.token);

            return data;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            // Call logout API if available
            if (token) {
                try {
                    await authService.logout();
                } catch (error) {
                    console.warn('Logout API call failed:', error);
                }
            }

            setUser(null);
            setToken(null);
            
            // Clear storage and cache
            await AsyncStorage.multiRemove(['userToken', 'user']);
            authService.setAuthToken(null);
            budgetService.clearCategoriesCache();
        } catch (error) {
            console.error('Logout failed:', error);
            // Still clear local state even if API call fails
            setUser(null);
            setToken(null);
        }
    }, [token]);

    const updateOnboardingPath = useCallback(async (professionalPath) => {
        try {
            if (!user) {
                throw new Error('No user found');
            }

            const updatedUser = { ...user, professionalPath };
            setUser(updatedUser);
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Clear categories cache when professional path changes
            budgetService.clearCategoriesCache();
        } catch (error) {
            console.error('Failed to update onboarding path:', error);
            throw error;
        }
    }, [user]);

    const completeOnboarding = useCallback(async (pinnedModules = []) => {
        try {
            const professionalPath = user?.professionalPath;
            if (!professionalPath) {
                throw new Error('Professional path not selected');
            }

            const data = await authService.updateOnboarding(professionalPath, pinnedModules);

            const updatedUser = {
                ...user,
                ...data,
                hasCompletedOnboarding: true,
                pinnedModules
            };

            setUser(updatedUser);
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

            return updatedUser;
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
            throw error;
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

    // Memoize the context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateOnboardingPath,
        completeOnboarding,
        updateUser,
        isAuthenticated: !!user && !!token,
        isOnboardingCompleted: user?.hasCompletedOnboarding || false,
    }), [user, token, loading, login, register, logout, updateOnboardingPath, completeOnboarding, updateUser]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};