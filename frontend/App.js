// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Contexts
import { AuthProvider, useAuth } from './store/contexts/AuthContext';
import { ThemeProvider, useTheme } from './store/contexts/ThemeContext';

// Navigation
import MainNavigator from './navigation/MainNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import OnboardingNavigator from './navigation/OnboardingNavigator';

// Services
import authService from './services/authService';

// For the new features, you'll need to either:
// 1. Add them to existing screens
// 2. Create new screens in the appropriate folders
// 3. Import them from the correct locations

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
                
                // Check if user needs onboarding
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

    // Determine which navigator to show
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