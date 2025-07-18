import React, { createContext, useState, useContext } from 'react';
import { PaperProvider, useTheme as usePaperTheme } from 'react-native-paper';
import { theme as customTheme } from '../../constants/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkTheme, setIsDarkTheme] = useState(false);

    const toggleTheme = () => {
        setIsDarkTheme(prev => !prev);
    };

    const theme = customTheme;

    return (
        <ThemeContext.Provider value={{ isDarkTheme, toggleTheme, theme }}>
            <PaperProvider theme={theme}>
                {children}
            </PaperProvider>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const paperTheme = usePaperTheme();
    const context = useContext(ThemeContext);
    
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    
    return {
        ...paperTheme,
        isDark: context.isDarkTheme,
        toggleTheme: context.toggleTheme,
    };
};