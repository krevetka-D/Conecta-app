// frontend/src/store/contexts/ThemeContext.js

import React, { createContext, useState, useContext } from 'react';
import { PaperProvider } from 'react-native-paper';
import { theme as customTheme } from '../../constants/theme'; // Import your defined theme

// Create the context for your theme logic
const ThemeContext = createContext();

/**
 * This is the new, unified ThemeProvider for your app.
 * It is responsible for rendering the PaperProvider and giving it the theme.
 */
export const ThemeProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const toggleTheme = () => {
    setIsDarkTheme(prev => !prev);
  };

  // This ensures the theme object is always valid.
  const theme = isDarkTheme ? customTheme : customTheme;

  return (
    <ThemeContext.Provider value={{ isDarkTheme, toggleTheme }}>
      {/* PaperProvider is now correctly rendered here, at the top of your app,
          and it receives the theme object directly. */}
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to access your theme's state (e.g., isDarkTheme)
export const useAppTheme = () => useContext(ThemeContext);
