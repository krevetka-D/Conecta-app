// src/navigation/OnboardingNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PathSelectionScreen from '../screens/onboarding/PathSelectionScreen';
import PrioritySelectionScreen from '../screens/onboarding/PrioritySelectionScreen';
import { SCREEN_NAMES } from '../constants';
import { SCREEN_TRANSITION_CONFIG } from '../constants';
import { colors } from '../constants';

const Stack = createStackNavigator();

const OnboardingNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                ...SCREEN_TRANSITION_CONFIG,
                cardStyle: {
                    backgroundColor: colors.background,
                },
            }}
            initialRouteName={SCREEN_NAMES.PATH_SELECTION}
        >
            <Stack.Screen
                name={SCREEN_NAMES.PATH_SELECTION}
                component={PathSelectionScreen}
                options={{
                    gestureEnabled: false, // Prevent going back
                }}
            />
            <Stack.Screen
                name={SCREEN_NAMES.PRIORITY_SELECTION}
                component={PrioritySelectionScreen}
                options={{
                    gestureEnabled: true,
                }}
            />
        </Stack.Navigator>
    );
};

export default OnboardingNavigator;