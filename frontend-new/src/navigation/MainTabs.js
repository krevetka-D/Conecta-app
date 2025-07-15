import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HubScreen from '../screens/Main/HubScreen';
import BudgetScreen from '../screens/Main/BudgetScreen';
import ChecklistScreen from '../screens/Main/ChecklistScreen';
import ProfileScreen from '../screens/Main/ProfileScreen';
import { ROUTES } from '../constants/routes';
import { COLORS } from '../constants/theme';
// To use icons, you would run: npx expo install @expo/vector-icons
// import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const MainTabs = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            //   tabBarIcon: ({ focused, color, size }) => {
            //     let iconName;
            //     if (route.name === ROUTES.HUB) iconName = focused ? 'home' : 'home-outline';
            //     else if (route.name === ROUTES.BUDGET) iconName = focused ? 'wallet' : 'wallet-outline';
            //     else if (route.name === ROUTES.CHECKLIST) iconName = focused ? 'checkbox' : 'checkbox-outline';
            //     else if (route.name === ROUTES.PROFILE) iconName = focused ? 'person' : 'person-outline';
            //     return <Ionicons name={iconName} size={size} color={color} />;
            //   },
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.gray,
            headerShown: false,
        })}
    >
        <Tab.Screen name={ROUTES.HUB} component={HubScreen} />
        <Tab.Screen name={ROUTES.BUDGET} component={BudgetScreen} />
        <Tab.Screen name={ROUTES.CHECKLIST} component={ChecklistScreen} />
        <Tab.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
    </Tab.Navigator>
);

export default MainTabs;