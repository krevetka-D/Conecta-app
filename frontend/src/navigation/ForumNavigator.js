// frontend/src/navigation/ForumNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ForumScreen from '../screens/forums/ForumScreen';
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
                component={ForumScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen 
                name="ChatRoom" 
                component={ForumDetailScreen}
                options={({ route }) => ({ 
                    title: route.params?.roomTitle || 'Chat Room' 
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