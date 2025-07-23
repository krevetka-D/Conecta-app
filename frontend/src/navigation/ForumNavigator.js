// frontend/src/navigation/ForumNavigator.js
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import { SCREEN_NAMES } from '../constants/routes';
import { colors } from '../constants/theme';
import ForumDetailScreen from '../screens/forums/ForumDetailScreen';
import ForumScreen from '../screens/forums/ForumScreen';
import ThreadDetailScreen from '../screens/forums/ThreadDetailScreen';

const Stack = createStackNavigator();

const ForumNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.primary,
                },
                headerTintColor: colors.textInverse,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Stack.Screen
                name="ForumsList"
                component={ForumScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="ChatRoom"
                component={ForumDetailScreen}
                options={({ route }) => ({
                    title: route.params?.roomTitle || 'Chat Room',
                })}
            />
            <Stack.Screen
                name="ThreadDetail"
                component={ThreadDetailScreen}
                options={({ route }) => ({
                    title: route.params?.threadTitle || 'Thread',
                })}
            />
        </Stack.Navigator>
    );
};

export default ForumNavigator;
