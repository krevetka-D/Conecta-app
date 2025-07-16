import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PathSelectionScreen from '../screens/onboarding/PathSelectionScreen';
import PrioritySelectionScreen from '../screens/onboarding/PrioritySelectionScreen';

const Stack = createStackNavigator();

const OnboardingNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyleInterpolator: ({ current, layouts }) => {
                    return {
                        cardStyle: {
                            transform: [
                                {
                                    translateX: current.progress.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [layouts.screen.width, 0],
                                    }),
                                },
                            ],
                        },
                    };
                },
            }}
        >
            <Stack.Screen name="PathSelection" component={PathSelectionScreen} />
            <Stack.Screen name="PrioritySelection" component={PrioritySelectionScreen} />
        </Stack.Navigator>
    );
};

export default OnboardingNavigator;