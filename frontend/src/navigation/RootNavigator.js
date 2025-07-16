// src/navigation/RootNavigator.js
import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Import navigators
import AuthNavigator from './AuthNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import MainNavigator from './MainNavigator';

// Import screens
import LoadingScreen from '../screens/LoadingScreen';

// Import contexts and constants
import { useAuth } from '../store';
import { useApp } from '../store';
import { NAVIGATOR_NAMES } from '../constants';
import { colors } from '../constants';

const Stack = createStackNavigator();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const RootNavigator = () => {
    const { user, loading: authLoading } = useAuth();
    const { appState } = useApp();

    useEffect(() => {
        // Hide splash screen when loading is complete
        if (!authLoading) {
            SplashScreen.hideAsync();
        }
    }, [authLoading]);

    // Show loading screen while checking auth state
    if (authLoading || appState.isFirstLaunch === null) {
        return <LoadingScreen />;
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animationEnabled: true,
            }}
        >
            {!user ? (
                // Not authenticated - show auth flow
                <Stack.Screen
                    name={NAVIGATOR_NAMES.AUTH}
                    component={AuthNavigator}
                    options={{
                        animationTypeForReplace: 'pop',
                    }}
                />
            ) : !user.onboardingCompleted ? (
                // Authenticated but not onboarded - show onboarding
                <Stack.Screen
                    name={NAVIGATOR_NAMES.ONBOARDING}
                    component={OnboardingNavigator}
                    options={{
                        gestureEnabled: false,
                        animationTypeForReplace: 'push',
                    }}
                />
            ) : (
                // Authenticated and onboarded - show main app
                <Stack.Screen
                    name={NAVIGATOR_NAMES.MAIN}
                    component={MainNavigator}
                    options={{
                        gestureEnabled: false,
                        animationTypeForReplace: 'push',
                    }}
                />
            )}
        </Stack.Navigator>
    );
};

export default RootNavigator;