// frontend/src/navigation/MainNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../store/contexts/ThemeContext';
import { SCREEN_NAMES } from '../constants/routes';

// Import all the screens for the tabs
import DashboardScreen from '../screens/main/DashboardScreen';
import BudgetScreen from '../screens/budget/BudgetScreen';
import ResourcesScreen from '../screens/content/ResourcesScreen';
import ChecklistScreen from '../screens/checklist/ChecklistScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import ForumsScreen from '../screens/forums/ForumScreen';
import EventsScreen from '../screens/events/EventsScreen';

const Tab = createBottomTabNavigator();

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
            <Tab.Screen name={SCREEN_NAMES.FORUMS} component={ForumsScreen} />
            <Tab.Screen name={SCREEN_NAMES.EVENTS} component={EventsScreen} />
            <Tab.Screen name={SCREEN_NAMES.PROFILE} component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default MainNavigator;