import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetRoot } from '../../navigation/NavigationService';
import authService from '../../services/authService';
import apiClient from '../../services/api/client';

// 1. Create the context
const AuthContext = createContext(null);

// 2. Create a custom hook for easy access to the context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// 3. Create the Provider component
export const AuthProvider = ({ children }) => {
    // State for user, token, and loading status
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Effect to load user token from storage on app start
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

    // Effect to set up a response interceptor for handling 401 Unauthorized errors
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

        // Cleanup function to remove the interceptor when the component unmounts
        return () => {
            apiClient.interceptors.response.eject(responseInterceptor);
        };
    }, []);

    // --- Core Authentication Functions ---

    const login = useCallback(async (email, password) => {
        try {
            const data = await authService.login(email, password);

            // ** THE FIX IS HERE **
            // The 'data' object itself is the user profile.
            setUser(data);
            setToken(data.token);

            // Also save the user object to storage so it can be restored on app reload
            await AsyncStorage.setItem('userToken', data.token);
            await AsyncStorage.setItem('user', JSON.stringify(data));

            return data;
        } catch (error) {
            console.error('Login failed:', error);
            throw error; // Re-throw to be handled by the UI
        }
    }, []);

    const signup = useCallback(async (name, email, password) => {
        try {
            const data = await authService.signup(name, email, password);
            setUser(data);
            setToken(data.token);
            await AsyncStorage.setItem('userToken', data.token);
            await AsyncStorage.setItem('user', JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Signup failed:', error);
            throw error;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            // Clear state
            setUser(null);
            setToken(null);
            // Remove data from storage
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('user');
            // Reset navigation to the login screen
            resetRoot();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }, []);

    // The value provided to consuming components
    const value = {
        user,
        token,
        loading,
        login,
        signup,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};