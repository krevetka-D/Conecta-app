import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import { colors } from '../constants/theme';
import CreateEventScreen from '../screens/events/CreateEventScreen';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import EventsScreen from '../screens/events/EventsScreen';

const Stack = createStackNavigator();

const EventNavigator = () => {
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
                name="EventsList"
                component={EventsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="EventDetail"
                component={EventDetailScreen}
                options={({ route }) => ({
                    title: route.params?.eventTitle || 'Event Details',
                })}
            />
            <Stack.Screen
                name="CreateEvent"
                component={CreateEventScreen}
                options={{ title: 'Create Event' }}
            />
        </Stack.Navigator>
    );
};

export default EventNavigator;
