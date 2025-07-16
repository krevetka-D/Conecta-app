// src/store/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { secureStorage } from '../../utils/security';
import authService from '../../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const bootstrapAsync = async () => {
            try {
                // Check for a stored user session
                const storedUser = await secureStorage.getItem('user');
                if (storedUser) {
                    setUser(storedUser);
                }
            } catch (e) {
                console.warn('Restoring user failed', e);
                // You might want to clear storage here if it's corrupted
                await secureStorage.clear();
            } finally {
                setLoading(false);
            }
        };

        bootstrapAsync();
    }, []);

    const login = async (email, password) => {
        try {
            const userData = await authService.login(email, password);
            // Assuming the user object has an `onboardingCompleted` flag
            // If not, you might need to fetch it or set a default
            if (userData.onboardingCompleted === undefined) {
                userData.onboardingCompleted = false; // Ensure property exists
            }
            setUser(userData);
            await secureStorage.setItem('user', userData);
            return userData;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const register = async (name, email, password) => {
        try {
            const userData = await authService.register(name, email, password);
            // New users have not completed onboarding
            userData.onboardingCompleted = false;
            setUser(userData);
            await secureStorage.setItem('user', userData);
            return userData;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        setUser(null);
        await secureStorage.removeItem('user');
        // You might want to also remove other user-specific data
    };

    // --- ONBOARDING FUNCTIONS ---

    const updateUserState = async (updatedData) => {
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        await secureStorage.setItem('user', newUser);
    };

    /**
     * Saves the professional path chosen during the first step of onboarding.
     * This function should be called from PathSelectionScreen.
     */
    const updateOnboardingPath = async (professionalPath) => {
        if (!user) return;
        try {
            await updateUserState({ professionalPath });
        } catch (error) {
            console.error('Failed to update onboarding path:', error);
            throw error;
        }
    };

    /**
     * Saves the chosen priorities and marks onboarding as complete.
     * This function should be called from PrioritySelectionScreen.
     */
    const completeOnboarding = async (priorities) => {
        if (!user) return;
        try {
            const updatedData = {
                priorities,
                onboardingCompleted: true,
            };
            await updateUserState(updatedData);
        } catch (error)
        {
            console.error('Failed to complete onboarding:', error);
            throw error;
        }
    };


    const value = {
        user,
        loading,
        login,
        logout,
        register,
        updateOnboardingPath, // Function for the first onboarding screen
        completeOnboarding,   // Function for the final onboarding screen
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
