import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../constants/theme';

// Import screens
import DashboardScreen from '../screens/main/DashboardScreen';
import BudgetScreen from '../screens/budget/BudgetScreen';
import ChecklistScreen from '../screens/checklist/ChecklistScreen';
import ResourcesScreen from '../screens/content/ResourcesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigators for each tab
const DashboardStack = () => (
    <Stack.Navigator>
        <Stack.Screen
            name="DashboardHome"
            component={DashboardScreen}
            options={{ headerShown: false }}
        />
    </Stack.Navigator>
);

const BudgetStack = () => (
    <Stack.Navigator>
        <Stack.Screen
            name="BudgetHome"
            component={BudgetScreen}
            options={{ title: 'Budget Planner' }}
        />
    </Stack.Navigator>
);

const ChecklistStack = () => (
    <Stack.Navigator>
        <Stack.Screen
            name="ChecklistHome"
            component={ChecklistScreen}
            options={{ title: 'Checklist' }}
        />
    </Stack.Navigator>
);

const ResourcesStack = () => (
    <Stack.Navigator>
        <Stack.Screen
            name="ResourcesHome"
            component={ResourcesScreen}
            options={{ title: 'Resources' }}
        />
    </Stack.Navigator>
);

const ProfileStack = () => (
    <Stack.Navigator>
        <Stack.Screen
            name="ProfileHome"
            component={ProfileScreen}
            options={{ title: 'Profile' }}
        />
    </Stack.Navigator>
);

const MainNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    switch (route.name) {
                        case 'Dashboard':
                            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
                            break;
                        case 'Budget':
                            iconName = focused ? 'calculator' : 'calculator-variant-outline';
                            break;
                        case 'Checklist':
                            iconName = focused ? 'checkbox-marked-circle' : 'checkbox-marked-circle-outline';
                            break;
                        case 'Resources':
                            iconName = focused ? 'book-open-page-variant' : 'book-open-page-variant-outline';
                            break;
                        case 'Profile':
                            iconName = focused ? 'account' : 'account-outline';
                            break;
                    }

                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                headerShown: false,
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardStack} />
            <Tab.Screen name="Budget" component={BudgetStack} />
            <Tab.Screen name="Checklist" component={ChecklistStack} />
            <Tab.Screen name="Resources" component={ResourcesStack} />
            <Tab.Screen name="Profile" component={ProfileStack} />
        </Tab.Navigator>
    );
};

export default MainNavigator;