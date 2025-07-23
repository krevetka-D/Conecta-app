import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import { SCREEN_NAMES } from '../constants/routes';
import { colors } from '../constants/theme';
import PathSelectionScreen from '../screens/onboarding/PathSelectionScreen';
import PrioritySelectionScreen from '../screens/onboarding/PrioritySelectionScreen';

const Stack = createStackNavigator();

const OnboardingNavigator = ({ onComplete }) => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: {
                    backgroundColor: colors.background,
                },
                animationEnabled: true,
                gestureEnabled: true,
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
                options={{
                    gestureEnabled: true,
                }}
            >
                {(props) => <PrioritySelectionScreen {...props} onComplete={onComplete} />}
            </Stack.Screen>
        </Stack.Navigator>
    );
};

export default OnboardingNavigator;
