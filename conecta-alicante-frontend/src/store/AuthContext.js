import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';

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
            const storedToken = await AsyncStorage.getItem('token');
            const storedUser = await AsyncStorage.getItem('user');

            if (storedToken && storedUser) {
                setUser(JSON.parse(storedUser));
                authService.setAuthToken(storedToken);
            }
        } catch (error) {
            console.error('Error loading auth:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const response = await authService.login(email, password);
            const { token, ...userData } = response;

            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            authService.setAuthToken(token);
            setUser(userData);

            return userData;
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    const register = async (name, email, password) => {
        try {
            setError(null);
            const response = await authService.register(name, email, password);
            const { token, ...userData } = response;

            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            authService.setAuthToken(token);
            setUser(userData);

            return userData;
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    const updateOnboarding = async (professionalPath, pinnedModules) => {
        try {
            const response = await authService.updateOnboarding(professionalPath, pinnedModules);
            const updatedUser = { ...user, ...response };
            setUser(updatedUser);
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            authService.setAuthToken(null);
            setUser(null);
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateOnboarding,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};