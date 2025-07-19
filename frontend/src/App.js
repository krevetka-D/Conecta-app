// frontend/src/App.js
import React, { useState, useEffect, Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox, View, Text, ActivityIndicator } from 'react-native';

// Import polyfills
import 'react-native-url-polyfill/auto';
import './utils/polyfills';

// Suppress warnings
LogBox.ignoreLogs([
    'Warning: isMounted(...) is deprecated',
    'Module RCTImageLoader requires',
    'Non-serializable values were found in the navigation state',
]);

// Add temporary debug for floating point error
if (__DEV__) {
    const originalWarn = console.warn;
    console.warn = (...args) => {
        if (args[0]?.includes('Unable to convert string to floating point value')) {
            console.log('=== FLOATING POINT ERROR DETAILS ===');
            console.log('Arguments:', args);
            console.trace();
            console.log('===================================');
        }
        originalWarn(...args);
    };
}

// Import contexts
import { AppProvider } from './store/contexts/AppContext';
import { AuthProvider, useAuth } from './store/contexts/AuthContext';
import { ThemeProvider } from './store/contexts/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy load navigators for better performance
const MainNavigator = React.lazy(() => import('./navigation/MainNavigator'));
const AuthNavigator = React.lazy(() => import('./navigation/AuthNavigator'));
const OnboardingNavigator = React.lazy(() => import('./navigation/OnboardingNavigator'));

// Import services
import authService from './services/authService';
import { initializeApiClient } from './services/api/client';
import LoadingSpinner from './components/common/LoadingSpinner';
import { navigationRef } from './navigation/NavigationService';
import { colors } from './constants/theme';

// Create a simple fallback loading component to avoid the size issue
const FallbackLoading = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.textSecondary }}>Loading...</Text>
    </View>
);

const AppContent = () => {
    const { user, setUser, loading: authLoading } = useAuth();
    const [initializing, setInitializing] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            await initializeApiClient();
            
            const token = await authService.getToken();
            if (token) {
                try {
                    const userData = await authService.getCurrentUser();
                    if (userData) {
                        setUser(userData);
                        if (!userData.preferences || !userData.hasCompletedOnboarding) {
                            setShowOnboarding(true);
                        }
                    }
                } catch (error) {
                    console.log('Failed to get current user, token might be expired');
                }
            }
        } catch (error) {
            console.error('App initialization failed:', error);
        } finally {
            setInitializing(false);
        }
    };

    if (initializing || authLoading) {
        return <FallbackLoading />;
    }

    return (
        <Suspense fallback={<FallbackLoading />}>
            {!user ? (
                <AuthNavigator />
            ) : showOnboarding ? (
                <OnboardingNavigator onComplete={() => setShowOnboarding(false)} />
            ) : (
                <MainNavigator />
            )}
        </Suspense>
    );
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