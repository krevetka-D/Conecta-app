import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import * as Font from 'expo-font';
import { AuthProvider } from './src/store/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { theme } from './src/constants/theme';

export default function App() {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        async function loadFonts() {
            await Font.loadAsync({
                'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
                'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
                'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
            });
            setFontsLoaded(true);
        }
        loadFonts();
    }, []);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <AuthProvider>
            <PaperProvider theme={theme}>
                <NavigationContainer>
                    <RootNavigator />
                </NavigationContainer>
            </PaperProvider>
        </AuthProvider>
    );
}