// frontend/src/store/contexts/ThemeContext.js
import React, { createContext, useState, useContext } from 'react';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';

import { theme as customTheme, colors, fonts, spacing } from '../../constants/theme';

const ThemeContext = createContext(null);

// Merge custom theme with Paper theme structure
const createTheme = (isDark = false) => {
    return {
        ...DefaultTheme,
        ...customTheme,
        colors: {
            ...DefaultTheme.colors,
            ...customTheme.colors,
            ...colors,
        },
        fonts: {
            ...DefaultTheme.fonts,
            ...customTheme.fonts,
            ...fonts,
        },
        spacing: {
            ...spacing,
            // Add Paper-specific spacing
            xs: spacing.xs,
            s: spacing.sm,
            m: spacing.md,
            l: spacing.lg,
            xl: spacing.xl,
        },
        roundness: customTheme.roundness || 8,
        dark: isDark,
        // Add any missing properties
        borderRadius: customTheme.borderRadius,
        shadows: customTheme.shadows,
    };
};

export const ThemeProvider = ({ children }) => {
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const currentTheme = createTheme(isDarkTheme);

    const toggleTheme = () => {
        setIsDarkTheme((prev) => !prev);
    };

    const themeValue = {
        isDarkTheme,
        toggleTheme,
        theme: currentTheme,
        colors: currentTheme.colors,
        fonts: currentTheme.fonts,
        spacing: currentTheme.spacing,
    };

    return (
        <ThemeContext.Provider value={themeValue}>
            <PaperProvider theme={currentTheme}>{children}</PaperProvider>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);

    if (!context) {
        // Return a default theme structure if context is not available
        const defaultTheme = createTheme(false);
        return {
            ...defaultTheme,
            isDark: false,
            toggleTheme: () => {},
        };
    }

    // Return the complete theme object
    return {
        ...context.theme,
        isDark: context.isDarkTheme,
        toggleTheme: context.toggleTheme,
        // Ensure all properties are available
        colors: context.colors || colors,
        fonts: context.fonts || fonts,
        spacing: context.spacing || spacing,
    };
};
