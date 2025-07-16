// src/store/contexts/ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext({});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [theme, setTheme] = useState('light');
    const [useSystemTheme, setUseSystemTheme] = useState(true);

    useEffect(() => {
        loadThemePreference();
    }, []);

    useEffect(() => {
        if (useSystemTheme) {
            setTheme(systemColorScheme || 'light');
        }
    }, [systemColorScheme, useSystemTheme]);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme');
            const savedUseSystem = await AsyncStorage.getItem('useSystemTheme');

            if (savedTheme) {
                setTheme(savedTheme);
            }
            if (savedUseSystem !== null) {
                setUseSystemTheme(savedUseSystem === 'true');
            }
        } catch (error) {
            console.error('Error loading theme preference:', error);
        }
    };

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        setUseSystemTheme(false);

        try {
            await AsyncStorage.setItem('theme', newTheme);
            await AsyncStorage.setItem('useSystemTheme', 'false');
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    const enableSystemTheme = async () => {
        setUseSystemTheme(true);
        setTheme(systemColorScheme || 'light');

        try {
            await AsyncStorage.setItem('useSystemTheme', 'true');
        } catch (error) {
            console.error('Error enabling system theme:', error);
        }
    };

    const value = {
        theme,
        isDark: theme === 'dark',
        useSystemTheme,
        toggleTheme,
        enableSystemTheme,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};