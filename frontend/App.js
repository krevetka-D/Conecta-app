// frontend/App.js

import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

import ErrorBoundary from './src/components/common/ErrorBoundary';
import RootNavigator from './src/navigation/RootNavigator';
import { AppProvider } from './src/store/contexts/AppContext';
import { AuthProvider } from './src/store/contexts/AuthContext';
// Import your single, unified ThemeProvider
import { ThemeProvider } from './src/store/contexts/ThemeContext';

export default function App() {
    return (
        <GestureHandlerRootView style={styles.container}>
            <ErrorBoundary>
                <AppProvider>
                    <AuthProvider>
                        {/* Your single ThemeProvider now wraps the entire app. */}
                        <ThemeProvider>
                            <StatusBar style="auto" />
                            <RootNavigator />
                        </ThemeProvider>
                    </AuthProvider>
                </AppProvider>
            </ErrorBoundary>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
