// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import * as Font from 'expo-font';

import { AuthProvider } from './src/store/contexts/AuthContext';
import { ThemeProvider } from './src/store/contexts/ThemeContext';
import { AppProvider } from './src/store/contexts/AppContext';
import RootNavigator from './src/navigation/RootNavigator';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import { theme } from './src/constants/theme';
import NavigationService from './src/navigation/NavigationService';

const App = () => {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        loadFonts();
    }, []);

    const loadFonts = async () => {
        try {
            await Font.loadAsync({
                'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
                'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
                'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
            });
        } catch (error) {
            console.warn('Error loading fonts:', error);
        } finally {
            setFontsLoaded(true);
        }
    };

    if (!fontsLoaded) {
        return null;
    }

    return (
        <ErrorBoundary>
            <AppProvider>
                <AuthProvider>
                    <ThemeProvider>
                        <PaperProvider theme={theme}>
                            <NavigationContainer
                                ref={(navigatorRef) => {
                                    NavigationService.setTopLevelNavigator(navigatorRef);
                                }}
                            >
                                <RootNavigator />
                            </NavigationContainer>
                        </PaperProvider>
                    </ThemeProvider>
                </AuthProvider>
            </AppProvider>
        </ErrorBoundary>
    );
};

export default App;