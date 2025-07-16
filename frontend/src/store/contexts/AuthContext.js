import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './AppContext';
import { resetRoot } from '../../navigation/NavigationService';
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

    // Effect to configure API interceptors based on the token
    useEffect(() => {
        const requestInterceptor = api.interceptors.request.use(
            (config) => {
                // Attach the token from state to every request
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseInterceptor = api.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response && error.response.status === 401) {
                    // If unauthorized, log the user out
                    await logout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.request.eject(requestInterceptor);
            api.interceptors.response.eject(responseInterceptor);
        };
    }, [token]); // This effect re-runs only when the token changes

    // Effect to load user session on app start
    useEffect(() => {
        const bootstrapAsync = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('userToken');
                const storedUser = await AsyncStorage.getItem('user');
                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                console.error('Failed to load user session', e);
            } finally {
                setLoading(false);
            }
        };

        bootstrapAsync();
    }, []);

    // --- Core Authentication Functions ---
    const login = async (email, password) => {
        try {
            // Assume the response is { user: { ... }, token: '...' }
            const { user, token } = await authService.login(email, password);

            // Set state correctly
            setUser(user);
            setToken(token);

            // Store data correctly
            await AsyncStorage.setItem('user', JSON.stringify(user));
            await AsyncStorage.setItem('userToken', token);

            return { user, token };
        } catch (error) {
            console.error('Login failed in AuthContext:', error);
            throw error;
        }
    };

    const register = async (name, email, password) => {
        try {
            const { user, token } = await authService.register(name, email, password);
            setUser(user);
            setToken(token);
            await AsyncStorage.setItem('user', JSON.stringify(user));
            await AsyncStorage.setItem('userToken', token);
            return { user, token };
        } catch (error) {
            console.error('Registration failed in AuthContext:', error);
            throw error;
        }
    };

    const logout = async () => {
        setUser(null);
        setToken(null);
        await AsyncStorage.multiRemove(['user', 'userToken']);
        resetRoot('Login');
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};