import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const AppContext = createContext({});

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const [isOnline, setIsOnline] = useState(true);
    const [loading, setLoading] = useState(true);
    const [appState, setAppState] = useState({
        isFirstLaunch: false,
        language: 'en',
        notifications: true,
    });

    // This effect runs once to initialize the app state and network listener.
    useEffect(() => {
        const initializeApp = async () => {
            try {
                const hasLaunched = await AsyncStorage.getItem('hasLaunched');
                if (hasLaunched === null) {
                    setAppState(prev => ({ ...prev, isFirstLaunch: true }));
                    await AsyncStorage.setItem('hasLaunched', 'true');
                } else {
                    setAppState(prev => ({ ...prev, isFirstLaunch: false }));
                }
            } catch (error) {
                console.error('Error initializing app:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeApp();

        const unsubscribeNetInfo = NetInfo.addEventListener(state => {
            setIsOnline(state.isConnected);
        });

        return () => unsubscribeNetInfo();
    }, []);

    const updateLanguage = useCallback(async (language) => {
        try {
            await AsyncStorage.setItem('language', language);
            setAppState(prev => ({ ...prev, language }));
        } catch (error) {
            console.error('Error updating language:', error);
        }
    }, []);

    const toggleNotifications = useCallback(async () => {
        try {
            const newValue = !appState.notifications;
            await AsyncStorage.setItem('notifications', newValue.toString());
            setAppState(prev => ({ ...prev, notifications: newValue }));
        } catch (error) {
            console.error('Error toggling notifications:', error);
        }
    }, [appState.notifications]);

    // useMemo prevents this value object from being recreated on every render.
    const value = useMemo(() => ({
        isOnline,
        loading,
        appState,
        updateLanguage,
        toggleNotifications,
    }), [isOnline, loading, appState, updateLanguage, toggleNotifications]);

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};