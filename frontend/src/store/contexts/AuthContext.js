import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetRoot } from '../../navigation/NavigationService';
import authService from '../../services/authService';
import apiClient from '../../services/api/client';

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

    useEffect(() => {
        const loadUserFromStorage = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('userToken');
                const storedUser = await AsyncStorage.getItem('user');
                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                console.error('Failed to load user data from storage', e);
            } finally {
                setLoading(false);
            }
        };

        loadUserFromStorage();
    }, []);

    useEffect(() => {
        const responseInterceptor = apiClient.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response && error.response.status === 401) {
                    console.log('Intercepted 401 Unauthorized, logging out...');
                    await logout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            apiClient.interceptors.response.eject(responseInterceptor);
        };
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

    const register = useCallback(async (name, email, password) => {
        try {
            const data = await authService.register(name, email, password);

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
            resetRoot();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }, []);

    const updateOnboardingPath = useCallback(async (professionalPath) => {
        try {
            // Just update the local user state temporarily
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