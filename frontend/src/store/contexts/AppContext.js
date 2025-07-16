// src/store/contexts/AppContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const AppContext = createContext({});

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const [isOnline, setIsOnline] = useState(true);
    const [appState, setAppState] = useState({
        isFirstLaunch: null,
        language: 'en',
        notifications: true,
    });

    useEffect(() => {
        checkFirstLaunch();
        setupNetworkListener();
    }, []);

    const checkFirstLaunch = async () => {
        try {
            const hasLaunched = await AsyncStorage.getItem('hasLaunched');
            if (hasLaunched === null) {
                await AsyncStorage.setItem('hasLaunched', 'true');
                setAppState(prev => ({ ...prev, isFirstLaunch: true }));
            } else {
                setAppState(prev => ({ ...prev, isFirstLaunch: false }));
            }
        } catch (error) {
            console.error('Error checking first launch:', error);
        }
    };

    const setupNetworkListener = () => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOnline(state.isConnected);
        });

        return () => unsubscribe();
    };

    const updateLanguage = async (language) => {
        try {
            await AsyncStorage.setItem('language', language);
            setAppState(prev => ({ ...prev, language }));
        } catch (error) {
            console.error('Error updating language:', error);
        }
    };

    const toggleNotifications = async () => {
        try {
            const newValue = !appState.notifications;
            await AsyncStorage.setItem('notifications', newValue.toString());
            setAppState(prev => ({ ...prev, notifications: newValue }));
        } catch (error) {
            console.error('Error toggling notifications:', error);
        }
    };

    const value = {
        isOnline,
        appState,
        updateLanguage,
        toggleNotifications,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};