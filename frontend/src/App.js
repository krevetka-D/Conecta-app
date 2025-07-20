// frontend/App.js
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { LogBox, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';

// Apply ActivityIndicator fix before any other imports
import { patchActivityIndicator } from './src/components/common/SafeActivityIndicator';
patchActivityIndicator();

import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/store/contexts/AuthContext';
import { ThemeProvider } from './src/store/contexts/ThemeContext';
import { AppProvider } from './src/store/contexts/AppContext';
import { initializeApiClient } from './src/services/api/client';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import { theme } from './src/constants/theme';
import { loadFonts } from './src/utils/fontLoader';

// Ignore specific warnings
LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
    'VirtualizedLists should never be nested',
    'Invariant Violation: "main" has not been registered',
    // Add the ActivityIndicator warning to ignore list as we've fixed it
    'Invariant Violation: ActivityIndicator does not support'
]);

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default function App() {
    const [appIsReady, setAppIsReady] = React.useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                // Load fonts
                await loadFonts();
                
                // Initialize API client with stored token
                await initializeApiClient();
                
                // Add artificial delay for splash screen (optional)
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (e) {
                console.warn('App initialization error:', e);
            } finally {
                setAppIsReady(true);
            }
        }

        prepare();
    }, []);

    const onLayoutRootView = React.useCallback(async () => {
        if (appIsReady) {
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return null;
    }

    return (
        <ErrorBoundary>
            <SafeAreaProvider onLayout={onLayoutRootView}>
                <AppProvider>
                    <ThemeProvider>
                        <AuthProvider>
                            <PaperProvider theme={theme}>
                                <NavigationContainer>
                                    <RootNavigator />
                                </NavigationContainer>
                            </PaperProvider>
                        </AuthProvider>
                    </ThemeProvider>
                </AppProvider>
            </SafeAreaProvider>
        </ErrorBoundary>
    );
}