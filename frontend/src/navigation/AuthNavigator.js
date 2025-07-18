// frontend/src/navigation/AuthNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import { SCREEN_NAMES } from '../constants/routes';
import { colors } from '../constants/theme';

const Stack = createStackNavigator();

const AuthNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: {
                    backgroundColor: colors.background,
                },
                // Use standard transition
                animationEnabled: true,
                gestureEnabled: true,
            }}
            initialRouteName={SCREEN_NAMES.WELCOME}
        >
            <Stack.Screen
                name={SCREEN_NAMES.WELCOME}
                component={WelcomeScreen}
                options={{
                    animationEnabled: false,
                }}
            />
            <Stack.Screen
                name={SCREEN_NAMES.LOGIN}
                component={LoginScreen}
                options={{
                    title: 'Sign In',
                    headerShown: true,
                    headerTransparent: true,
                    headerTintColor: colors.primary,
                    headerLeftContainerStyle: {
                        paddingLeft: 10,
                    },
                }}
            />
            <Stack.Screen
                name={SCREEN_NAMES.REGISTER}
                component={RegisterScreen}
                options={{
                    title: 'Create Account',
                    headerShown: true,
                    headerTransparent: true,
                    headerTintColor: colors.primary,
                    headerLeftContainerStyle: {
                        paddingLeft: 10,
                    },
                }}
            />
        </Stack.Navigator>
    );
};

export default AuthNavigator;