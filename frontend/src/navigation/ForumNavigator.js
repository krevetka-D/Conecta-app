// frontend/src/navigation/ForumNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ForumsScreen from '../screens/forums/ForumScreen';
import ForumDetailScreen from '../screens/forums/ForumDetailScreen';
import ThreadDetailScreen from '../screens/forums/ThreadDetailScreen';
import { SCREEN_NAMES } from '../constants/routes';
import { colors } from '../constants/theme';

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
                component={ForumsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen 
                name="ForumDetail" 
                component={ForumDetailScreen}
                options={({ route }) => ({ 
                    title: route.params?.forumTitle || 'Forum' 
                })}
            />
            <Stack.Screen 
                name="ThreadDetail" 
                component={ThreadDetailScreen}
                options={({ route }) => ({ 
                    title: route.params?.threadTitle || 'Thread' 
                })}
            />
        </Stack.Navigator>
    );
};

export default ForumNavigator;