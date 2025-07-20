// frontend/src/App.js
import 'react-native-gesture-handler';
import React, { useEffect, useCallback } from 'react';
import { LogBox, Platform, View, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';

// Apply global patches before any other imports
import { applyGlobalPatches } from './utils/globalPatches';
applyGlobalPatches();

import RootNavigator from './navigation/RootNavigator';
import { AuthProvider } from './store/contexts/AuthContext';
import { ThemeProvider } from './store/contexts/ThemeContext';
import { AppProvider } from './store/contexts/AppContext';
import { initializeApiClient } from './services/api/client';
import ErrorBoundary from './components/common/ErrorBoundary';
import { theme } from './constants/theme';
import { loadFonts } from './utils/fontLoader';

// Ignore specific warnings
LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
    'VirtualizedLists should never be nested',
    'Invariant Violation: "main" has not been registered',
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

    const onLayoutRootView = useCallback(async () => {
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