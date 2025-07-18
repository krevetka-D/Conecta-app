// frontend/src/navigation/AppNavigator.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../store/contexts/AuthContext';
import MainNavigator from './MainNavigator';
import AuthNavigator from './AuthNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import LoadingScreen from '../screens/LoadingScreen';

/**
 * AppNavigator is the primary navigator for the application.
 * It determines which navigation stack to display based on the user's
 * authentication status and onboarding completion.
 */
const AppNavigator = () => {
    // Use the custom AuthContext to get user status
    const { user, isLoading, isOnboardingCompleted } = useAuth();

    // Show a loading screen while checking for authentication status
    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <NavigationContainer>
            {user ? (
                // If the user is logged in, check if they have completed onboarding
                isOnboardingCompleted ? (
                    <MainNavigator />
                ) : (
                    <OnboardingNavigator />
                )
            ) : (
                // If no user is logged in, show the authentication flow
                <AuthNavigator />
            )}
        </NavigationContainer>
    );
};

export default AppNavigator;
