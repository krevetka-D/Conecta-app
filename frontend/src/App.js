// frontend/src/App.js
// This file is now correctly located in the 'src' directory.
// All import paths have been updated relative to this new location.

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Contexts (Corrected paths to include 'store')
import { AuthProvider, useAuth } from './store/contexts/AuthContext';
import { ThemeProvider, useTheme } from './store/contexts/ThemeContext';

// Navigation (Corrected paths to be relative to 'src')
import MainNavigator from './navigation/MainNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import OnboardingNavigator from './navigation/OnboardingNavigator';

// Services (Corrected path to be relative to 'src')
import authService from './services/authService';

const AppContent = () => {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = await authService.getToken();
            if (token) {
                const userData = await authService.getCurrentUser();
                setUser(userData);
                
                if (!userData.preferences || !userData.hasCompletedOnboarding) {
                    setShowOnboarding(true);
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return null; // Or a loading screen
    }

    if (!user) {
        return <AuthNavigator />;
    }

    if (showOnboarding) {
        return <OnboardingNavigator onComplete={() => setShowOnboarding(false)} />;
    }

    return <MainNavigator />;
};

export default function App() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <ThemeProvider>
                    <PaperProvider>
                        <NavigationContainer>
                            <AppContent />
                        </NavigationContainer>
                    </PaperProvider>
                </ThemeProvider>
            </AuthProvider>
        </SafeAreaProvider>
    );
};
