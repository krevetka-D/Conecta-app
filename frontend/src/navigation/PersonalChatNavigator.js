// frontend/src/navigation/PersonalChatNavigator.js
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import { SCREEN_NAMES } from '../constants/routes';
import { colors } from '../constants/theme';
import PersonalChatDetailScreen from '../screens/personalChat/PersonalChatDetailScreen';
import PersonalChatListScreen from '../screens/personalChat/PersonalChatListScreen';
import UserProfileScreen from '../screens/personalChat/UserProfileScreen';

const Stack = createStackNavigator();

const PersonalChatNavigator = () => {
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
                name={SCREEN_NAMES.PERSONAL_CHAT_LIST}
                component={PersonalChatListScreen}
                options={{
                    title: 'Messages',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name={SCREEN_NAMES.PERSONAL_CHAT_DETAIL}
                component={PersonalChatDetailScreen}
                options={({ route }) => ({
                    title: route.params?.userName || 'Chat',
                    headerBackTitle: 'Back',
                })}
            />
            <Stack.Screen
                name={SCREEN_NAMES.USER_PROFILE}
                component={UserProfileScreen}
                options={({ route }) => ({
                    title: route.params?.userName || 'Profile',
                })}
            />
        </Stack.Navigator>
    );
};

export default PersonalChatNavigator;
