// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper'; // Import PaperProvider

import ErrorBoundary from './src/components/common/ErrorBoundary';
import RootNavigator from './src/navigation/RootNavigator';
import { AppProvider } from './src/store/contexts/AppContext';
import { AuthProvider } from './src/store/contexts/AuthContext';
import { ThemeProvider } from './src/store/contexts/ThemeContext';

export default function App() {
    return (
        <GestureHandlerRootView style={styles.container}>
            <ErrorBoundary>
                <AppProvider>
                    <AuthProvider>
                        <ThemeProvider>
                            {/* Wrap the navigator with PaperProvider */}
                            <PaperProvider>
                                <StatusBar style="auto" />
                                <RootNavigator />
                            </PaperProvider>
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