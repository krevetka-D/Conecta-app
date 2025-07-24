import 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useCallback } from 'react';
import { LogBox, Platform, View, Text, AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';

// Import web polyfills first - ONLY for web
if (Platform.OS === 'web') {
    require('./utils/webPolyfills');
}

// Apply global patches
import ErrorBoundaryWrapper from './components/common/ErrorBoundaryWrapper';
import RootNavigator from './navigation/RootNavigator';
import optimizedApiClient from './services/api/client';
import { AppProvider } from './store/contexts/AppContext';
import { AuthProvider } from './store/contexts/AuthContext';
import { ThemeProvider } from './store/contexts/ThemeContext';
import { devLog, devError, devWarn } from './utils';
import { showErrorAlert } from './utils/alerts';
import appStability, { getPerformanceReport } from './utils/appStability';
import appStabilityManager from './utils/appStabilityEnhancements';
import { cache } from './utils/cacheManager';
import { loadFonts } from './utils/fontLoader';
import { applyGlobalPatches } from './utils/globalPatches';
import { onNetworkChange } from './utils/networkRetry';

applyGlobalPatches();

// Enable screens for better performance
enableScreens();

// Ignore specific warnings
LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
    'VirtualizedLists should never be nested',
    'Invariant Violation: "main" has not been registered',
    'Setting a timer for a long period of time',
    'Possible Unhandled Promise Rejection',
]);

// Keep splash screen visible while loading (native only)
if (Platform.OS !== 'web') {
    SplashScreen.preventAutoHideAsync().catch(() => {
        // Handle error silently
    });
}

// Global error handler
const globalErrorHandler = (error, isFatal) => {
    if (__DEV__) {
        devError('App', 'Global error', { error, isFatal });
    }

    // Log to error tracking service
    // Sentry.captureException(error);

    if (isFatal) {
        showErrorAlert(
            'Application Error',
            'The app encountered a critical error and needs to restart.',
            () => {
                // Restart app or navigate to safe screen
            },
        );
    }
};

// Set global error handlers
// eslint-disable-next-line no-undef
if (typeof ErrorUtils !== 'undefined') {
    // eslint-disable-next-line no-undef
    ErrorUtils.setGlobalHandler(globalErrorHandler);
}

export default function App() {
    const [appIsReady, setAppIsReady] = React.useState(false);
    const [initError, setInitError] = React.useState(null);
    const appStateRef = React.useRef(AppState.currentState);

    useEffect(() => {
        async function prepare() {
            try {
                // Set up auth failure handler
                optimizedApiClient.setAuthFailureHandler(() => {
                    // Handle auth failure globally
                    const { resetRoot } = require('./navigation/NavigationService');
                    resetRoot();
                });

                // Load fonts (will handle web gracefully)
                await loadFonts();

                // Set up API client authorization header if token exists
                const token = await AsyncStorage.getItem('userToken');
                if (token) {
                    optimizedApiClient.client.defaults.headers.common[
                        'Authorization'
                    ] = `Bearer ${token}`;
                }

                // Preload critical cache data
                await cache.preload([
                    {
                        key: 'app_config',
                        fetcher: async () => {
                            // Fetch app configuration
                            return { version: '1.0.0', features: {} };
                        },
                        options: { ttl: 24 * 60 * 60 * 1000, persistent: true },
                    },
                ]);

                // Initialize app stability monitoring
                appStabilityManager.initialize();
                
                // Add artificial delay for splash screen (native only)
                if (Platform.OS !== 'web') {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
            } catch (e) {
                devWarn('App', 'App initialization error', e);
                setInitError(e);
            } finally {
                setAppIsReady(true);
            }
        }

        prepare();

        // Monitor app state changes
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
                // App has come to the foreground
                devLog('App', 'App has come to the foreground!');

                // Refresh critical data
                if (global.refreshUserData) {
                    global.refreshUserData();
                }
            }
            appStateRef.current = nextAppState;
        });

        // Monitor network changes
        const unsubscribeNetwork = onNetworkChange((isOnline) => {
            devLog('App', `Network status: ${isOnline ? 'Online' : 'Offline'}`);

            // Set global network status
            global.isOnline = isOnline;

            // Show/hide offline banner
            if (global.setOfflineBanner) {
                global.setOfflineBanner(!isOnline);
            }
        });

        // Cleanup
        return () => {
            // Use the subscription's remove method instead of removeEventListener
            if (subscription && typeof subscription.remove === 'function') {
                subscription.remove();
            }
            unsubscribeNetwork();
            appStability.cleanup();
        };
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady && Platform.OS !== 'web') {
            await SplashScreen.hideAsync().catch(() => {
                // Handle error silently
            });
        }
    }, [appIsReady]);

    // Performance monitoring in development
    useEffect(() => {
        if (__DEV__) {
            const interval = setInterval(() => {
                const report = getPerformanceReport();
                devLog('App', 'Performance Report', report);
            }, 60000); // Every minute

            return () => clearInterval(interval);
        }
    }, []);

    if (!appIsReady) {
        return null;
    }

    // Show initialization error screen
    if (initError) {
        return (
            <SafeAreaProvider>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 20,
                    }}
                >
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                        Initialization Error
                    </Text>
                    <Text style={{ textAlign: 'center', color: '#666' }}>
                        {initError.message || 'Failed to initialize the app'}
                    </Text>
                </View>
            </SafeAreaProvider>
        );
    }

    return (
        <ErrorBoundaryWrapper
            showDetails={__DEV__}
            onReset={() => {
                // Reset app state
                cache.clear();
                setAppIsReady(false);
                setInitError(null);
                // Re-initialize
                setTimeout(() => setAppIsReady(true), 100);
            }}
        >
            <SafeAreaProvider onLayout={onLayoutRootView}>
                <AppProvider>
                    <ThemeProvider>
                        <AuthProvider>
                            <RootNavigator />
                        </AuthProvider>
                    </ThemeProvider>
                </AppProvider>
            </SafeAreaProvider>
        </ErrorBoundaryWrapper>
    );
}
