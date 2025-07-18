// frontend/src/store/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../../services/authService';
import { showErrorAlert } from '../../utils/alerts';

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
                const storedToken = await AsyncStorage.getItem('userToken');
                const storedUser = await AsyncStorage.getItem('user');

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    const userData = JSON.parse(storedUser);
                    setUser(userData);
                    authService.setAuthToken(storedToken);
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

            await AsyncStorage.setItem('userToken', data.token);
            await AsyncStorage.setItem('user', JSON.stringify(data.user));
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

            await AsyncStorage.setItem('userToken', data.token);
            await AsyncStorage.setItem('user', JSON.stringify(data.user));
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
            await AsyncStorage.multiRemove(['userToken', 'user']);
            authService.setAuthToken(null);
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
        } catch (error) {
            console.error('Failed to update user:', error);
            throw error;
        }
    }, [user]);

    const value = {
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
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};