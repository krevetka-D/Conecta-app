// frontend/src/store/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../../services/authService';

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
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error('Failed to load user data from storage', error);
            } finally {
                setLoading(false);
            }
        };

        loadUserFromStorage();
    }, []);

    const login = useCallback(async (email, password) => {
        try {
            const data = await authService.login(email, password);
            
            setUser(data);
            setToken(data.token);
            
            await AsyncStorage.setItem('userToken', data.token);
            await AsyncStorage.setItem('user', JSON.stringify(data));
            
            return data;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }, []);

    const register = useCallback(async (name, email, password, professionalPath = null) => {
        try {
            const data = await authService.register(name, email, password, professionalPath);
            
            setUser(data);
            setToken(data.token);
            
            await AsyncStorage.setItem('userToken', data.token);
            await AsyncStorage.setItem('user', JSON.stringify(data));
            
            return data;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            setUser(null);
            setToken(null);
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('user');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }, []);

    const updateOnboardingPath = useCallback(async (professionalPath) => {
        try {
            setUser(prev => ({ ...prev, professionalPath }));
        } catch (error) {
            console.error('Failed to update onboarding path:', error);
            throw error;
        }
    }, []);

    const completeOnboarding = useCallback(async (pinnedModules) => {
        try {
            const professionalPath = user?.professionalPath;
            if (!professionalPath) {
                throw new Error('Professional path not selected');
            }

            const data = await authService.updateOnboarding(professionalPath, pinnedModules);
            
            setUser(data);
            await AsyncStorage.setItem('user', JSON.stringify(data));
            
            return data;
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
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
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};