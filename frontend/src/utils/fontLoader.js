// frontend/src/utils/fontLoader.js
import * as Font from 'expo-font';
import { Platform } from 'react-native';

// Define font mappings
const FONT_MAP = {
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-Light': require('../../assets/fonts/Poppins-Light.ttf'),
};

// Track if fonts are loaded
let fontsLoaded = false;

export const loadFonts = async () => {
    if (fontsLoaded) return true;

    try {
        // Only load custom fonts on native platforms
        if (Platform.OS !== 'web') {
            await Font.loadAsync(FONT_MAP);
            fontsLoaded = true;
        }
        return true;
    } catch (error) {
        console.warn('Failed to load custom fonts, using system fonts:', error);
        // Return true anyway to allow the app to continue with system fonts
        return true;
    }
};

export const getFontFamily = (fontName) => {
    // If fonts are loaded and we're on native, use custom fonts
    if (fontsLoaded && Platform.OS !== 'web') {
        return fontName;
    }

    // Otherwise, use system fonts
    const systemFonts = {
        'Poppins-Regular': Platform.select({
            ios: 'System',
            android: 'Roboto',
            default: 'sans-serif',
        }),
        'Poppins-Bold': Platform.select({
            ios: 'System',
            android: 'Roboto-Bold',
            default: 'sans-serif',
        }),
        'Poppins-SemiBold': Platform.select({
            ios: 'System',
            android: 'Roboto-Medium',
            default: 'sans-serif',
        }),
        'Poppins-Medium': Platform.select({
            ios: 'System',
            android: 'Roboto-Medium',
            default: 'sans-serif',
        }),
        'Poppins-Light': Platform.select({
            ios: 'System',
            android: 'Roboto-Light',
            default: 'sans-serif',
        }),
    };

    return systemFonts[fontName] || Platform.select({
        ios: 'System',
        android: 'Roboto',
        default: 'sans-serif',
    });
};

export const resetFonts = () => {
    fontsLoaded = false;
};