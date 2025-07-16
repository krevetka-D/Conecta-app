// src/navigation/MainNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Platform } from 'react-native';

// Import screens
import DashboardScreen from '../screens/main/DashboardScreen';
import BudgetScreen from '../screens/budget/BudgetScreen';
import ChecklistScreen from '../screens/checklist/ChecklistScreen';
import ResourcesScreen from '../screens/content/ResourcesScreen';
import GuideDetailScreen from '../screens/content/GuideDetailScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Import constants
import { SCREEN_NAMES, TAB_NAMES } from '../constants/routes';
import { colors, fonts } from '../constants/theme';
import { TAB_BAR_DIMENSIONS } from '../constants/dimensions';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigators for each tab
const DashboardStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerStyle: {
                backgroundColor: colors.primary,
                elevation: 0,
                shadowOpacity: 0,
            },
            headerTintColor: colors.textInverse,
            headerTitleStyle: {
                fontFamily: fonts.families.semiBold,
                fontSize: fonts.sizes.lg,
            },
        }}
    >
        <Stack.Screen
            name={SCREEN_NAMES.DASHBOARD_HOME}
            component={DashboardScreen}
            options={{
                headerShown: false,
            }}
        />
    </Stack.Navigator>
);

const BudgetStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerStyle: {
                backgroundColor: colors.surface,
                elevation: 1,
                shadowOpacity: 0.1,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
                fontFamily: fonts.families.semiBold,
                fontSize: fonts.sizes.lg,
            },
        }}
    >
        <Stack.Screen
            name={SCREEN_NAMES.BUDGET_HOME}
            component={BudgetScreen}
            options={{
                title: 'Budget Planner',
            }}
        />
    </Stack.Navigator>
);

const ChecklistStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerStyle: {
                backgroundColor: colors.surface,
                elevation: 1,
                shadowOpacity: 0.1,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
                fontFamily: fonts.families.semiBold,
                fontSize: fonts.sizes.lg,
            },
        }}
    >
        <Stack.Screen
            name={SCREEN_NAMES.CHECKLIST_HOME}
            component={ChecklistScreen}
            options={{
                title: 'Checklist',
            }}
        />
    </Stack.Navigator>
);

const ResourcesStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerStyle: {
                backgroundColor: colors.surface,
                elevation: 1,
                shadowOpacity: 0.1,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
                fontFamily: fonts.families.semiBold,
                fontSize: fonts.sizes.lg,
            },
        }}
    >
        <Stack.Screen
            name={SCREEN_NAMES.RESOURCES_HOME}
            component={ResourcesScreen}
            options={{
                title: 'Resources',
            }}
        />
        <Stack.Screen
            name={SCREEN_NAMES.GUIDE_DETAIL}
            component={GuideDetailScreen}
            options={({ route }) => ({
                title: route.params?.title || 'Guide',
            })}
        />
    </Stack.Navigator>
);

const ProfileStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerStyle: {
                backgroundColor: colors.surface,
                elevation: 1,
                shadowOpacity: 0.1,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
                fontFamily: fonts.families.semiBold,
                fontSize: fonts.sizes.lg,
            },
        }}
    >
        <Stack.Screen
            name={SCREEN_NAMES.PROFILE_HOME}
            component={ProfileScreen}
            options={{
                title: 'Profile',
            }}
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
                        case TAB_NAMES.DASHBOARD_TAB:
                            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
                            break;
                        case TAB_NAMES.BUDGET_TAB:
                            iconName = focused ? 'calculator' : 'calculator-variant-outline';
                            break;
                        case TAB_NAMES.CHECKLIST_TAB:
                            iconName = focused ? 'checkbox-marked-circle' : 'checkbox-marked-circle-outline';
                            break;
                        case TAB_NAMES.RESOURCES_TAB:
                            iconName = focused ? 'book-open-page-variant' : 'book-open-page-variant-outline';
                            break;
                        case TAB_NAMES.PROFILE_TAB:
                            iconName = focused ? 'account' : 'account-outline';
                            break;
                        default:
                            iconName = 'circle';
                    }

                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                headerShown: false,
                tabBarStyle: {
                    height: TAB_BAR_DIMENSIONS.height,
                    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
                    paddingTop: 10,
                    backgroundColor: colors.surface,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    elevation: 8,
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    shadowOffset: {
                        width: 0,
                        height: -2,
                    },
                },
                tabBarLabelStyle: {
                    fontSize: TAB_BAR_DIMENSIONS.labelFontSize,
                    fontFamily: fonts.families.regular,
                    marginTop: -5,
                    marginBottom: 5,
                },
                tabBarIconStyle: {
                    marginTop: 5,
                },
            })}
        >
            <Tab.Screen
                name={TAB_NAMES.DASHBOARD_TAB}
                component={DashboardStack}
                options={{
                    tabBarLabel: 'Dashboard',
                }}
            />
            <Tab.Screen
                name={TAB_NAMES.BUDGET_TAB}
                component={BudgetStack}
                options={{
                    tabBarLabel: 'Budget',
                }}
            />
            <Tab.Screen
                name={TAB_NAMES.CHECKLIST_TAB}
                component={ChecklistStack}
                options={{
                    tabBarLabel: 'Checklist',
                }}
            />
            <Tab.Screen
                name={TAB_NAMES.RESOURCES_TAB}
                component={ResourcesStack}
                options={{
                    tabBarLabel: 'Resources',
                }}
            />
            <Tab.Screen
                name={TAB_NAMES.PROFILE_TAB}
                component={ProfileStack}
                options={{
                    tabBarLabel: 'Profile',
                }}
            />
        </Tab.Navigator>
    );
};

export default MainNavigator;