// frontend/src/navigation/MainNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../store/contexts/ThemeContext';
import { SCREEN_NAMES } from '../constants/routes';

// Import all the screens for the tabs
import EnhancedDashboardScreen from '../screens/main/EnhancedDashboardScreen';
import EventsScreen from '../screens/events/EventsScreen';
import ForumsScreen from '../screens/forums/ForumsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Import nested navigators
import ForumNavigator from './ForumNavigator';
import EventNavigator from './EventNavigator';
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainNavigator = () => {
    const theme = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === SCREEN_NAMES.DASHBOARD) {
                        iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
                    } else if (route.name === SCREEN_NAMES.BUDGET) {
                        iconName = focused ? 'finance' : 'finance';
                    } else if (route.name === SCREEN_NAMES.RESOURCES) {
                        iconName = focused ? 'book-open-page-variant' : 'book-open-page-variant-outline';
                    } else if (route.name === SCREEN_NAMES.CHECKLIST) {
                        iconName = focused ? 'clipboard-check' : 'clipboard-check-outline';
                    } else if (route.name === SCREEN_NAMES.PROFILE) {
                        iconName = focused ? 'account-circle' : 'account-circle-outline';
                    } else if (route.name === SCREEN_NAMES.FORUMS) {
                        iconName = focused ? 'forum' : 'forum-outline';
                    } else if (route.name === SCREEN_NAMES.EVENTS) {
                        iconName = focused ? 'calendar-multiple' : 'calendar-multiple-outline';
                    }
                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: theme.isDark ? theme.colors.surface : theme.colors.surface,
                    borderTopColor: theme.colors.border || theme.colors.backdrop,
                },
            })}
        >
            <Tab.Screen name={SCREEN_NAMES.DASHBOARD} component={DashboardScreen} />
            <Tab.Screen name={SCREEN_NAMES.BUDGET} component={BudgetScreen} />
            <Tab.Screen name={SCREEN_NAMES.RESOURCES} component={ResourcesScreen} />
            <Tab.Screen name={SCREEN_NAMES.CHECKLIST} component={ChecklistScreen} />
            <Tab.Screen name={SCREEN_NAMES.FORUMS} component={ForumNavigator} />
            <Tab.Screen name={SCREEN_NAMES.EVENTS} component={EventNavigator} />
            <Tab.Screen name={SCREEN_NAMES.PROFILE} component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default MainNavigator;