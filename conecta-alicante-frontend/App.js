// App.js
import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import * as Font from 'expo-font';

import { AuthProvider, ThemeProvider, AppProvider} from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import { theme } from './src/constants';
import NavigationService from './src/navigation/NavigationService';

const App = () => {
    console.log('App.js - Starting');
    const [fontsLoaded, setFontsLoaded] = useState(true);

    useEffect(() => {
        console.log('App.js - useEffect');
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
    console.log('App.js - Rendering, fontsLoaded:', fontsLoaded);

    if (!fontsLoaded) {
        console.log('App.js - Waiting for fonts');
        return null;
    }
    console.log('App.js - Rendering main app');

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