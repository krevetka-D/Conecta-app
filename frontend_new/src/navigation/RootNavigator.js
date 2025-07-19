
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../store/contexts/AuthContext';
import { useApp } from '../store/contexts/AppContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator'; // Corrected from AppNavigator
import FullScreenLoader from '../components/common/LoadingSpinner';
import { navigationRef } from './NavigationService'; // Import the ref

const RootNavigator = () => {
    const { user, loading: authLoading } = useAuth();
    const { loading: appLoading } = useApp();

    // Show a loader while contexts are initializing
    if (appLoading || authLoading) {
        return <FullScreenLoader />;
    }

    // The NavigationContainer now correctly wraps the actual navigators
    return (
        <NavigationContainer ref={navigationRef}>
            {user ? <MainNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
};

export default RootNavigator;