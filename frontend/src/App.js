// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';

// Suppress specific warnings
LogBox.ignoreLogs([
    'Warning: isMounted(...) is deprecated',
    'Module RCTImageLoader requires',
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
import LoadingSpinner from './components/common/LoadingSpinner';

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
        return <LoadingSpinner fullScreen text="Loading..." />;
    }

    if (!user) {
        return <AuthNavigator />;
    }

    if (showOnboarding) {
        return <OnboardingNavigator onComplete={() => setShowOnboarding(false)} />;
    }

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
                                <NavigationContainer>
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