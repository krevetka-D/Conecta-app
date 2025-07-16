// src/store/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../../services/authService';
import { secureStorage } from '../../utils/security';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await secureStorage.getItem('token');
            const storedUser = await secureStorage.getItem('user');

            if (storedToken && storedUser) {
                setUser(storedUser);
                authService.setAuthToken(storedToken);

                // Verify token is still valid
                try {
                    const currentUser = await authService.getMe();
                    setUser(currentUser);
                } catch (error) {
                    // Token expired, clear auth
                    await clearAuth();
                }
            }
        } catch (error) {
            console.error('Error loading auth:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = useCallback(async (email, password) => {
        try {
            setError(null);
            const response = await authService.login(email, password);
            const { token, ...userData } = response;

            await secureStorage.setItem('token', token);
            await secureStorage.setItem('user', userData);
            authService.setAuthToken(token);
            setUser(userData);

            return userData;
        } catch (error) {
            setError(error.message);
            throw error;
        }
    }, []);

    const register = useCallback(async (name, email, password) => {
        try {
            setError(null);
            const response = await authService.register(name, email, password);
            const { token, ...userData } = response;

            await secureStorage.setItem('token', token);
            await secureStorage.setItem('user', userData);
            authService.setAuthToken(token);
            setUser(userData);

            return userData;
        } catch (error) {
            setError(error.message);
            throw error;
        }
    }, []);

    const updateOnboarding = useCallback(async (professionalPath, pinnedModules) => {
        try {
            const response = await authService.updateOnboarding(professionalPath, pinnedModules);
            const updatedUser = { ...user, ...response };
            setUser(updatedUser);
            await secureStorage.setItem('user', updatedUser);
            return updatedUser;
        } catch (error) {
            setError(error.message);
            throw error;
        }
    }, [user]);

    const updateProfile = useCallback(async (profileData) => {
        try {
            const response = await authService.updateProfile(profileData);
            const updatedUser = { ...user, ...response };
            setUser(updatedUser);
            await secureStorage.setItem('user', updatedUser);
            return updatedUser;
        } catch (error) {
            setError(error.message);
            throw error;
        }
    }, [user]);

    const clearAuth = async () => {
        await secureStorage.removeItem('token');
        await secureStorage.removeItem('user');
        authService.setAuthToken(null);
        setUser(null);
    };

    const logout = useCallback(async () => {
        try {
            await clearAuth();
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }, []);

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateOnboarding,
        updateProfile,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};