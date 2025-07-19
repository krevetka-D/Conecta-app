// frontend/src/App.js
import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox, View, Text } from 'react-native';
import * as Network from 'expo-network';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Import polyfills
import 'react-native-url-polyfill/auto';
import './utils/polyfills';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Suppress warnings
LogBox.ignoreLogs([
    'Warning: isMounted(...) is deprecated',
    'Module RCTImageLoader requires',
    'Non-serializable values were found in the navigation state',
]);

// Import contexts
import { AppProvider } from './store/contexts/AppContext';
import { AuthProvider, useAuth } from './store/contexts/AuthContext';
import { ThemeProvider } from './store/contexts/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';

// Import components
import NetworkDiagnostics from './components/NetworkDiagnostics';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy load navigators for better performance
const MainNavigator = React.lazy(() => import('./navigation/MainNavigator'));
const AuthNavigator = React.lazy(() => import('./navigation/AuthNavigator'));
const OnboardingNavigator = React.lazy(() => import('./navigation/OnboardingNavigator'));

// Import services
import authService from './services/authService';
import { initializeApiClient } from './services/api/client';
import { navigationRef } from './navigation/NavigationService';

const AppContent = () => {
    const { user, setUser, loading: authLoading } = useAuth();
    const [initializing, setInitializing] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [networkError, setNetworkError] = useState(false);

    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            // Check network connectivity first
            const networkState = await Network.getNetworkStateAsync();
            if (!networkState.isConnected) {
                setNetworkError(true);
                setInitializing(false);
                return;
            }
            
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
            setNetworkError(true);
        } finally {
            setInitializing(false);
        }
    };

    // Handle network error
    if (networkError) {
        return (
            <NetworkDiagnostics 
                onRetry={() => {
                    setNetworkError(false);
                    setInitializing(true);
                    initializeApp();
                }} 
            />
        );
    }

    if (initializing || authLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <LoadingSpinner fullScreen text="Loading..." />
            </View>
        );
    }

    return (
        <Suspense fallback={<LoadingSpinner fullScreen />}>
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
    // Load fonts
    const [fontsLoaded, fontError] = useFonts({
        'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
        'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
        'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
        'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
        'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
    });

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded || fontError) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    if (!fontsLoaded && !fontError) {
        return null;
    }

    return (
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
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
        </View>
    );
};

export default App;