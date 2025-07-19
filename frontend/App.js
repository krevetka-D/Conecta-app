// frontend/src/App.js
import React, { useState, useEffect, Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox, View, Text, ActivityIndicator } from 'react-native';

// Apply global patches FIRST - before any other imports
import './utils/globalPatches';
import { applyGlobalPatches } from './utils/globalPatches';

// Import polyfills
import 'react-native-url-polyfill/auto';
import './utils/polyfills';

// Apply patches
applyGlobalPatches();

// Suppress warnings
LogBox.ignoreLogs([
    'Warning: isMounted(...) is deprecated',
    'Module RCTImageLoader requires',
    'Non-serializable values were found in the navigation state',
    'Unable to convert string to floating point value', // Suppress the floating point error
]);

// Add enhanced debug logging for development
if (__DEV__) {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
        // Check for specific errors we want to track
        if (args[0]?.includes('Unable to convert string to floating point value')) {
            console.log('=== FLOATING POINT ERROR INTERCEPTED ===');
            console.log('Error details:', args);
            console.trace('Stack trace:');
            console.log('=====================================');
            // Don't show the original error since we're handling it
            return;
        }
        originalError(...args);
    };
    
    console.warn = (...args) => {
        // Check for specific warnings
        if (args[0]?.includes('Unable to convert string to floating point value')) {
            console.log('=== FLOATING POINT WARNING INTERCEPTED ===');
            console.log('Warning details:', args);
            console.trace('Stack trace:');
            console.log('=========================================');
            // Don't show the original warning
            return;
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
import { navigationRef } from './navigation/NavigationService';
import { colors } from './constants/theme';

// Create a simple fallback loading component
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
    // Log that app is starting with patches applied
    useEffect(() => {
        if (__DEV__) {
            console.log('App started with global patches applied');
        }
    }, []);

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