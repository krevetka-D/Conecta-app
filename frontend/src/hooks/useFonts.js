// frontend/src/hooks/useFonts.js
import * as Font from 'expo-font';
import { useEffect, useState } from 'react';

export const useFonts = () => {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        async function loadFonts() {
            try {
                await Font.loadAsync({
                    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
                    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
                    'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
                    'Poppins-Medium': require('../../assets/fonts/Poppins-Medium.ttf'),
                    'Poppins-Light': require('../../assets/fonts/Poppins-Light.ttf'),
                });
                setFontsLoaded(true);
            } catch (error) {
                console.error('Error loading fonts:', error);
                // Set to true anyway to prevent app from being stuck
                setFontsLoaded(true);
            }
        }

        loadFonts();
    }, []);

    return fontsLoaded;
};
