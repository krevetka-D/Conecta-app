import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../store/contexts/ThemeContext';
import { SCREEN_NAMES } from '../constants/routes';
import { colors } from '../constants/theme';

// Import all the screens for the tabs
import DashboardScreen from '../screens/main/DashboardScreen';
import BudgetScreen from '../screens/budget/BudgetScreen'; // <-- Import BudgetScreen
import ResourcesScreen from '../screens/content/ResourcesScreen';
import ChecklistScreen from '../screens/checklist/ChecklistScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
    const { isDark } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === SCREEN_NAMES.DASHBOARD) {
                        iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
                    } else if (route.name === SCREEN_NAMES.BUDGET) { // <-- Add icon logic
                        iconName = focused ? 'finance' : 'finance';
                    } else if (route.name === SCREEN_NAMES.RESOURCES) {
                        iconName = focused ? 'book-open-page-variant' : 'book-open-page-variant-outline';
                    } else if (route.name === SCREEN_NAMES.CHECKLIST) {
                        iconName = focused ? 'clipboard-check' : 'clipboard-check-outline';
                    } else if (route.name === SCREEN_NAMES.PROFILE) {
                        iconName = focused ? 'account-circle' : 'account-circle-outline';
                    }
                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: isDark ? colors.backgroundDark : colors.white,
                    borderTopColor: isDark ? colors.backgroundDark : colors.border,
                },
            })}
        >
            <Tab.Screen name={SCREEN_NAMES.DASHBOARD} component={DashboardScreen} />
            {/* --- Add the Budget Screen as a new tab --- */}
            <Tab.Screen name={SCREEN_NAMES.BUDGET} component={BudgetScreen} />
            {/* ----------------------------------------- */}
            <Tab.Screen name={SCREEN_NAMES.RESOURCES} component={ResourcesScreen} />
            <Tab.Screen name={SCREEN_NAMES.CHECKLIST} component={ChecklistScreen} />
            <Tab.Screen name={SCREEN_NAMES.PROFILE} component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default MainNavigator;