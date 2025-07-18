// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox, View, Text } from 'react-native';

// Import polyfills at the very top
import 'react-native-url-polyfill/auto';

// Suppress specific warnings
LogBox.ignoreLogs([
    'Warning: isMounted(...) is deprecated',
    'Module RCTImageLoader requires',
    'URL.protocol is not implemented',
    'Non-serializable values were found in the navigation state',
]);

// Import contexts in correct order
import { AppProvider } from './store/contexts/AppContext';
import { AuthProvider, useAuth } from './store/contexts/AuthContext';
import { ThemeProvider, useTheme } from './store/contexts/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';

// Import navigation
import MainNavigator from './navigation/MainNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import OnboardingNavigator from './navigation/OnboardingNavigator';

// Import services
import authService from './services/authService';
import { initializeApiClient } from './services/api/client';
import LoadingSpinner from './components/common/LoadingSpinner';
import { navigationRef } from './navigation/NavigationService';

const AppContent = () => {
    const { user, setUser, loading: authLoading, refreshToken } = useAuth();
    const [initializing, setInitializing] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            // Initialize API client with stored token
            await initializeApiClient();
            
            // Check if we have a stored token
            const token = await authService.getToken();
            if (token) {
                try {
                    // Try to refresh user data
                    const userData = await authService.getCurrentUser();
                    if (userData) {
                        setUser(userData);
                        if (!userData.preferences || !userData.hasCompletedOnboarding) {
                            setShowOnboarding(true);
                        }
                    }
                } catch (error) {
                    console.log('Failed to get current user, token might be expired');
                    // Token is invalid, user will be redirected to login
                }
            }
        } catch (error) {
            console.error('App initialization failed:', error);
        } finally {
            setInitializing(false);
        }
    };

    // Show loading spinner while initializing
    if (initializing || authLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <LoadingSpinner fullScreen text="Loading..." />
            </View>
        );
    }

    // No user, show auth navigator
    if (!user) {
        return <AuthNavigator />;
    }

    // User exists but needs onboarding
    if (showOnboarding) {
        return <OnboardingNavigator onComplete={() => setShowOnboarding(false)} />;
    }

    // User is authenticated and onboarded
    return <MainNavigator />;
};

const App = () => {
    return (
        <ErrorBoundary>
            <SafeAreaProvider>
                <AppProvider>
                    <ThemeProvider>
                        <AuthProvider>
                            <PaperProvider>
                                <NavigationContainer ref={navigationRef}>
                                    <AppContent />
                                </NavigationContainer>
                            </PaperProvider>
                        </AuthProvider>
                    </ThemeProvider>
                </AppProvider>
            </SafeAreaProvider>
        </ErrorBoundary>
    );
};

export default App;