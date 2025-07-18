// frontend/src/store/contexts/ThemeContext.js

import React, { createContext, useState, useContext } from 'react';
import { PaperProvider, useTheme as usePaperTheme } from 'react-native-paper';
import { theme as customTheme } from '../../constants/theme';

// Create the context for your theme logic
const ThemeContext = createContext();

/**
 * This is the unified ThemeProvider for your app.
 * It provides both Paper theme and custom theme state.
 */
export const ThemeProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const toggleTheme = () => {
    setIsDarkTheme(prev => !prev);
  };

  // For now, we use the same theme regardless of dark mode
  // You can extend this to have a dark theme variant
  const theme = customTheme;

  return (
    <ThemeContext.Provider value={{ isDarkTheme, toggleTheme, theme }}>
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to access your theme's state
export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};

// Export a hook that combines both Paper theme and custom theme state
export const useTheme = () => {
  const paperTheme = usePaperTheme();
  const appTheme = useAppTheme();
  
  return {
    ...paperTheme,
    isDark: appTheme.isDarkTheme,
    toggleTheme: appTheme.toggleTheme,
  };
};