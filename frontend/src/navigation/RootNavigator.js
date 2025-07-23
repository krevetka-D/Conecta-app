import { NavigationContainer } from '@react-navigation/native';
import React from 'react';

import FullScreenLoader from '../components/common/LoadingSpinner';
import { useApp } from '../store/contexts/AppContext';
import { useAuth } from '../store/contexts/AuthContext';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator'; // Corrected from AppNavigator
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
