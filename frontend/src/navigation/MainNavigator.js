// frontend/src/navigation/MainNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '../components/common/Icon.js';

import { useTheme } from '../store/contexts/ThemeContext';
import { SCREEN_NAMES } from '../constants/routes';

// Import all required screens
import DashboardScreen from '../screens/main/DashboardScreen';
import BudgetScreen from '../screens/budget/BudgetScreen';
import ChecklistScreen from '../screens/checklist/ChecklistScreen';
import ResourcesScreen from '../screens/content/ResourcesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Import nested navigators
import ForumNavigator from './ForumNavigator';
import EventNavigator from './EventNavigator';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
    const theme = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    switch (route.name) {
                        case SCREEN_NAMES.DASHBOARD:
                            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
                            break;
                        case SCREEN_NAMES.BUDGET:
                            iconName = focused ? 'finance' : 'finance';
                            break;
                        case SCREEN_NAMES.RESOURCES:
                            iconName = focused ? 'book-open-page-variant' : 'book-open-page-variant-outline';
                            break;
                        case SCREEN_NAMES.CHECKLIST:
                            iconName = focused ? 'clipboard-check' : 'clipboard-check-outline';
                            break;
                        case SCREEN_NAMES.PROFILE:
                            iconName = focused ? 'account-circle' : 'account-circle-outline';
                            break;
                        case SCREEN_NAMES.FORUMS:
                            iconName = focused ? 'forum' : 'forum-outline';
                            break;
                        case SCREEN_NAMES.EVENTS:
                            iconName = focused ? 'calendar-multiple' : 'calendar-multiple-outline';
                            break;
                        default:
                            iconName = 'circle';
                    }
                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors?.primary || '#1E3A8A',
                tabBarInactiveTintColor: theme.colors?.textSecondary || '#6B7280',
                tabBarStyle: {
                    backgroundColor: theme.colors?.surface || '#FFFFFF',
                    borderTopColor: theme.colors?.border || '#E5E7EB',
                },
            })}
        >
            <Tab.Screen
                name={SCREEN_NAMES.DASHBOARD}
                component={DashboardScreen}
                options={{ title: 'Home' }}
            />
            <Tab.Screen
                name={SCREEN_NAMES.BUDGET}
                component={BudgetScreen}
                options={{ title: 'Budget' }}
            />
            <Tab.Screen
                name={SCREEN_NAMES.RESOURCES}
                component={ResourcesScreen}
                options={{ title: 'Resources' }}
            />
            <Tab.Screen
                name={SCREEN_NAMES.CHECKLIST}
                component={ChecklistScreen}
                options={{ title: 'Checklist' }}
            />
            <Tab.Screen
                name={SCREEN_NAMES.FORUMS}
                component={ForumNavigator}
                options={{ title: 'Forums' }}
            />
            <Tab.Screen
                name={SCREEN_NAMES.EVENTS}
                component={EventNavigator}
                options={{ title: 'Events' }}
            />
            <Tab.Screen
                name={SCREEN_NAMES.PROFILE}
                component={ProfileScreen}
                options={{ title: 'Profile' }}
            />
        </Tab.Navigator>
    );
};

export default MainNavigator;