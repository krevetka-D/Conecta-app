// frontend/src/navigation/MainNavigator.js
import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '../components/common/Icon.js';

import { useTheme } from '../store/contexts/ThemeContext';
import { SCREEN_NAMES } from '../constants/routes';

// Create error boundary for screens
const ScreenErrorBoundary = ({ children, screenName }) => {
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
        setHasError(false);
    }, [screenName]);

    if (hasError) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Error loading {screenName}</Text>
            </View>
        );
    }

    try {
        return children;
    } catch (error) {
        console.error(`Error in ${screenName}:`, error);
        setHasError(true);
        return null;
    }
};

// Create safe screen wrapper
const SafeScreen = ({ component: Component, screenName, ...props }) => {
    return (
        <ScreenErrorBoundary screenName={screenName}>
            <Component {...props} />
        </ScreenErrorBoundary>
    );
};

// Import screens with error handling
let DashboardScreen, BudgetScreen, ChecklistScreen, ResourcesScreen, ProfileScreen, ForumNavigator, EventNavigator, PersonalChatNavigator;

try {
    DashboardScreen = require('../screens/main/DashboardScreen').default;
} catch (e) {
    console.error('Failed to load DashboardScreen:', e);
    DashboardScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Dashboard Error</Text></View>;
}

try {
    BudgetScreen = require('../screens/budget/BudgetScreen').default;
} catch (e) {
    console.error('Failed to load BudgetScreen:', e);
    BudgetScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Budget Error</Text></View>;
}

try {
    ChecklistScreen = require('../screens/checklist/ChecklistScreen').default;
} catch (e) {
    console.error('Failed to load ChecklistScreen:', e);
    ChecklistScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Checklist Error</Text></View>;
}

try {
    ResourcesScreen = require('../screens/content/ResourcesScreen').default;
} catch (e) {
    console.error('Failed to load ResourcesScreen:', e);
    ResourcesScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Resources Error</Text></View>;
}

try {
    ProfileScreen = require('../screens/main/ProfileScreen').default;
} catch (e) {
    console.error('Failed to load ProfileScreen:', e);
    ProfileScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Profile Error</Text></View>;
}

try {
    ForumNavigator = require('./ForumNavigator').default;
} catch (e) {
    console.error('Failed to load ForumNavigator:', e);
    ForumNavigator = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Forums Error</Text></View>;
}

try {
    EventNavigator = require('./EventNavigator').default;
} catch (e) {
    console.error('Failed to load EventNavigator:', e);
    EventNavigator = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Events Error</Text></View>;
}

try {
    PersonalChatNavigator = require('./PersonalChatNavigator').default;
} catch (e) {
    console.error('Failed to load PersonalChatNavigator:', e);
    PersonalChatNavigator = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Chat Error</Text></View>;
}

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
    const theme = useTheme();
    
    // Provide default theme if undefined
    const safeTheme = {
        colors: {
            primary: '#1E3A8A',
            textSecondary: '#6B7280',
            surface: '#FFFFFF',
            border: '#E5E7EB',
            ...theme?.colors
        }
    };

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    switch (route.name) {
                        case SCREEN_NAMES.DASHBOARD:
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case SCREEN_NAMES.PERSONAL_CHAT:
                            iconName = focused ? 'message' : 'message-outline';
                            break;
                        case SCREEN_NAMES.BUDGET:
                            iconName = focused ? 'finance' : 'finance';
                            break;
                        case SCREEN_NAMES.FORUMS:
                            iconName = focused ? 'forum' : 'forum-outline';
                            break;
                        case SCREEN_NAMES.RESOURCES:
                            iconName = focused ? 'book-open-page-variant' : 'book-open-page-variant-outline';
                            break;
                        case SCREEN_NAMES.EVENTS:
                            iconName = focused ? 'calendar-month' : 'calendar-month-outline';
                            break;
                        default:
                            iconName = 'circle';
                    }
                    
                    // Fallback if Icon component fails
                    try {
                        return <Icon name={iconName} size={size} color={color} />;
                    } catch (error) {
                        console.error('Icon error:', error);
                        return <Text style={{ color, fontSize: size }}>•</Text>;
                    }
                },
                tabBarActiveTintColor: safeTheme.colors.primary,
                tabBarInactiveTintColor: safeTheme.colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: safeTheme.colors.surface,
                    borderTopColor: safeTheme.colors.border,
                },
            })}
        >
            {/* 1. Home */}
            <Tab.Screen
                name={SCREEN_NAMES.DASHBOARD}
                options={{ title: 'Home' }}
            >
                {(props) => <SafeScreen component={DashboardScreen} screenName="Dashboard" {...props} />}
            </Tab.Screen>
            
            {/* 2. Personal Chat */}
            <Tab.Screen
                name={SCREEN_NAMES.PERSONAL_CHAT}
                options={{ title: 'Chat' }}
            >
                {(props) => <SafeScreen component={PersonalChatNavigator} screenName="PersonalChat" {...props} />}
            </Tab.Screen>
            
            {/* 3. Budget */}
            <Tab.Screen
                name={SCREEN_NAMES.BUDGET}
                options={{ title: 'Budget' }}
            >
                {(props) => <SafeScreen component={BudgetScreen} screenName="Budget" {...props} />}
            </Tab.Screen>
            
            {/* 4. Chat Groups (Forums) */}
            <Tab.Screen
                name={SCREEN_NAMES.FORUMS}
                options={{ title: 'Groups' }}
            >
                {(props) => <SafeScreen component={ForumNavigator} screenName="Forums" {...props} />}
            </Tab.Screen>
            
            {/* 5. Resources */}
            <Tab.Screen
                name={SCREEN_NAMES.RESOURCES}
                options={{ title: 'Resources' }}
            >
                {(props) => <SafeScreen component={ResourcesScreen} screenName="Resources" {...props} />}
            </Tab.Screen>
            
            {/* 6. Events */}
            <Tab.Screen
                name={SCREEN_NAMES.EVENTS}
                options={{ title: 'Events' }}
            >
                {(props) => <SafeScreen component={EventNavigator} screenName="Events" {...props} />}
            </Tab.Screen>

            {/* Hidden screens */}
            <Tab.Screen
                name={SCREEN_NAMES.CHECKLIST}
                options={{ 
                    title: 'Checklist',
                    tabBarButton: () => null 
                }}
            >
                {(props) => <SafeScreen component={ChecklistScreen} screenName="Checklist" {...props} />}
            </Tab.Screen>
            
            <Tab.Screen
                name={SCREEN_NAMES.PROFILE}
                options={{ 
                    title: 'Profile',
                    tabBarButton: () => null 
                }}
            >
                {(props) => <SafeScreen component={ProfileScreen} screenName="Profile" {...props} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
};

export default MainNavigator;