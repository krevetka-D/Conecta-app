// frontend/src/store/contexts/ThemeContext.js
import React, { createContext, useState, useContext } from 'react';
import { PaperProvider, useTheme as usePaperTheme } from 'react-native-paper';
import { theme as customTheme } from '../../constants/theme';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [isDarkTheme, setIsDarkTheme] = useState(false);

    const toggleTheme = () => {
        setIsDarkTheme(prev => !prev);
    };

    const themeValue = {
        isDarkTheme,
        toggleTheme,
        theme: customTheme,
    };

    return (
        <ThemeContext.Provider value={themeValue}>
            <PaperProvider theme={customTheme}>
                {children}
            </PaperProvider>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    const paperTheme = usePaperTheme();

    if (!context) {
        // Return a default theme if context is not available
        return {
            ...customTheme,
            isDark: false,
            toggleTheme: () => {},
        };
    }

    return {
        ...paperTheme,
        ...context.theme,
        isDark: context.isDarkTheme,
        toggleTheme: context.toggleTheme,
    };
};