import React from 'react';
import { Provider } from 'react-redux';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';

import { store } from './src/app/store';
import AppNavigator from './src/navigation/AppNavigator';
import LoadingSpinner from './src/components/common/LoadingSpinner';

export default function App() {
    const [fontsLoaded] = useFonts({
        'Poppins-Regular': require('./src/assets/fonts/Poppins-Regular.ttf'),
        'Poppins-Bold': require('./src/assets/fonts/Poppins-Bold.ttf'),
    });

    if (!fontsLoaded) {
        return <LoadingSpinner />;
    }

    return (
        <Provider store={store}>
            <AppNavigator />
            <StatusBar style="auto" />
        </Provider>
    );
}