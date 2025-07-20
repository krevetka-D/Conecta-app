// frontend/src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox, View, Text, Platform, ActivityIndicator } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Import polyfills
import 'react-native-url-polyfill/auto';
import './utils/polyfills';

// Conditionally import Network for native platforms only
let Network;
if (Platform.OS !== 'web') {
    Network = require('expo-network');
}

// Keep the splash screen visible while we fetch resources
if (Platform.OS !== 'web') {
    SplashScreen.preventAutoHideAsync().catch(() => {
        // Handle error silently
    });
}

// Suppress warnings
LogBox.ignoreLogs([
    'Warning: isMounted(...) is deprecated',
    'Module RCTImageLoader requires',
    'Non-serializable values were found in the navigation state',
    'VirtualizedLists should never be nested',
    'fontFamily "Poppins-Regular" is not a system font',
    'fontFamily "Poppins-Bold" is not a system font',
    'fontFamily "Poppins-SemiBold" is not a system font',
]);

// Import contexts
import { AppProvider } from './store/contexts/AppContext';
import { AuthProvider, useAuth } from './store/contexts/AuthContext';
import { ThemeProvider } from './store/contexts/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';

// Import components
import NetworkDiagnostics from './components/NetworkDiagnostics';
import LoadingSpinner from './components/common/LoadingSpinner';

// Import navigators directly (not lazy loaded for now to avoid issues)
import MainNavigator from './navigation/MainNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import OnboardingNavigator from './navigation/OnboardingNavigator';

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
            // Check network connectivity for native platforms
            if (Platform.OS !== 'web' && Network) {
                const networkState = await Network.getNetworkStateAsync();
                if (!networkState.isConnected) {
                    setNetworkError(true);
                    setInitializing(false);
                    return;
                }
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
            if (Platform.OS !== 'web') {
                setNetworkError(true);
            }
        } finally {
            setInitializing(false);
        }
    };

    // Handle network error
    if (networkError && Platform.OS !== 'web') {
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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' }}>
                <ActivityIndicator size="large" color="#1E3A8A" />
                <Text style={{ marginTop: 10, color: '#6B7280' }}>Loading...</Text>
            </View>
        );
    }

    return (
        <>
            {!user ? (
                <AuthNavigator />
            ) : showOnboarding ? (
                <OnboardingNavigator onComplete={() => setShowOnboarding(false)} />
            ) : (
                <MainNavigator />
            )}
        </>
    );
};

const App = () => {
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                // Load fonts
                await Font.loadAsync({
                    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
                    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
                    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
                    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
                    'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
                });
            } catch (e) {
                console.warn('Error loading fonts:', e);
                // Continue without custom fonts
            } finally {
                // Tell the application to render
                setAppIsReady(true);
                
                // Hide splash screen
                if (Platform.OS !== 'web') {
                    await SplashScreen.hideAsync();
                }
            }
        }

        prepare();
    }, []);

    if (!appIsReady) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' }}>
                <ActivityIndicator size="large" color="#1E3A8A" />
            </View>
        );
    }

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