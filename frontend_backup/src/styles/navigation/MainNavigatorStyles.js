// src/styles/navigation/MainNavigatorStyles.js
import { StyleSheet, Platform } from 'react-native';
import { colors, fonts, spacing, borderRadius, shadows } from '../../constants/theme';
import { TAB_BAR_DIMENSIONS, HEADER_DIMENSIONS } from '../../constants/dimensions';

export const styles = StyleSheet.create({
    // Tab Bar Styles
    tabBar: {
        height: TAB_BAR_DIMENSIONS.height,
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        paddingTop: 10,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        ...shadows.md,
    },

    tabBarLabel: {
        fontSize: TAB_BAR_DIMENSIONS.labelFontSize,
        fontFamily: fonts.families.regular,
        marginTop: -5,
        marginBottom: 5,
    },

    tabBarIcon: {
        marginTop: 5,
    },

    // Stack Header Styles
    headerStyle: {
        backgroundColor: colors.primary,
        height: HEADER_DIMENSIONS.height,
        elevation: 0,
        shadowOpacity: 0,
    },

    headerTitleStyle: {
        fontFamily: fonts.families.semiBold,
        fontSize: fonts.sizes.lg,
        color: colors.textInverse,
    },

    headerBackTitleStyle: {
        fontFamily: fonts.families.regular,
        fontSize: fonts.sizes.sm,
        color: colors.textInverse,
    },

    headerLeftContainerStyle: {
        paddingLeft: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    },

    headerRightContainerStyle: {
        paddingRight: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    },

    // Screen-specific header styles
    surfaceHeaderStyle: {
        backgroundColor: colors.surface,
        elevation: 1,
        shadowOpacity: 0.1,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },

    surfaceHeaderTitleStyle: {
        color: colors.text,
    },

    transparentHeaderStyle: {
        backgroundColor: 'transparent',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
    },

    // Card style for navigator transitions
    cardStyle: {
        backgroundColor: colors.background,
    },

    // Drawer styles (if using drawer navigator)
    drawerStyle: {
        backgroundColor: colors.surface,
        width: '80%',
    },

    drawerContentStyle: {
        paddingTop: Platform.OS === 'ios' ? spacing.xl : 0,
    },

    drawerItemStyle: {
        borderRadius: borderRadius.md,
        marginHorizontal: spacing.sm,
        marginVertical: spacing.xs,
    },

    drawerLabelStyle: {
        fontFamily: fonts.families.regular,
        fontSize: fonts.sizes.md,
        marginLeft: -spacing.md,
    },

    drawerActiveTintColor: {
        color: colors.primary,
    },

    drawerInactiveTintColor: {
        color: colors.text,
    },

    drawerActiveBackgroundColor: {
        backgroundColor: colors.primaryLight + '20',
    },

    // Modal presentation styles
    modalCardStyle: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
    },

    modalHeaderStyle: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        shadowOpacity: 0,
        elevation: 0,
    },

    // Custom tab bar component styles (if using custom tab bar)
    customTabBar: {
        flexDirection: 'row',
        height: TAB_BAR_DIMENSIONS.height,
        backgroundColor: colors.surface,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        ...shadows.md,
    },

    customTabBarItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: spacing.sm,
    },

    customTabBarItemActive: {
        // Active tab item styles
    },

    customTabBarIcon: {
        marginBottom: spacing.xs,
    },

    customTabBarLabel: {
        fontSize: TAB_BAR_DIMENSIONS.labelFontSize,
        fontFamily: fonts.families.regular,
        textAlign: 'center',
    },

    customTabBarLabelActive: {
        color: colors.primary,
        fontFamily: fonts.families.semiBold,
    },

    customTabBarLabelInactive: {
        color: colors.textSecondary,
    },

    // Badge styles for tab bar
    tabBarBadge: {
        position: 'absolute',
        top: -4,
        right: -10,
        backgroundColor: colors.error,
        borderRadius: borderRadius.full,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xs,
    },

    tabBarBadgeText: {
        color: colors.textInverse,
        fontSize: fonts.sizes.xs,
        fontFamily: fonts.families.semiBold,
    },

    // Focus indicator for accessibility
    focusIndicator: {
        position: 'absolute',
        bottom: 0,
        left: '20%',
        right: '20%',
        height: 3,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.full,
    },

    // Loading state for lazy-loaded screens
    screenLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },

    // Error boundary styles
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: spacing.xl,
    },

    errorText: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.md,
    },
});

// Animation configurations
export const navigationAnimations = {
    // Default slide animation
    slideFromRight: {
        cardStyleInterpolator: ({ current, layouts }) => ({
            cardStyle: {
                transform: [
                    {
                        translateX: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.width, 0],
                        }),
                    },
                ],
            },
        }),
    },

    // Fade animation
    fade: {
        cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
                opacity: current.progress,
            },
        }),
    },

    // Modal slide from bottom
    modalSlideFromBottom: {
        cardStyleInterpolator: ({ current, layouts }) => ({
            cardStyle: {
                transform: [
                    {
                        translateY: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.height, 0],
                        }),
                    },
                ],
            },
        }),
    },

    // Scale animation
    scale: {
        cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
                opacity: current.progress,
                transform: [
                    {
                        scale: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.9, 1],
                        }),
                    },
                ],
            },
        }),
    },
};

// Screen options presets
export const screenOptionsPresets = {
    // Default stack screen options
    defaultStack: {
        headerStyle: styles.headerStyle,
        headerTitleStyle: styles.headerTitleStyle,
        headerBackTitleStyle: styles.headerBackTitleStyle,
        headerTintColor: colors.textInverse,
        cardStyle: styles.cardStyle,
        ...navigationAnimations.slideFromRight,
    },

    // Surface header stack options
    surfaceStack: {
        headerStyle: styles.surfaceHeaderStyle,
        headerTitleStyle: styles.surfaceHeaderTitleStyle,
        headerTintColor: colors.text,
        cardStyle: styles.cardStyle,
        ...navigationAnimations.slideFromRight,
    },

    // Modal stack options
    modalStack: {
        presentation: 'modal',
        headerStyle: styles.modalHeaderStyle,
        headerTitleStyle: styles.surfaceHeaderTitleStyle,
        headerTintColor: colors.text,
        cardStyle: styles.modalCardStyle,
        ...navigationAnimations.modalSlideFromBottom,
    },

    // Transparent header options
    transparentHeader: {
        headerStyle: styles.transparentHeaderStyle,
        headerTitleStyle: styles.headerTitleStyle,
        headerTintColor: colors.primary,
        headerTransparent: true,
        cardStyle: styles.cardStyle,
    },

    // No header options
    noHeader: {
        headerShown: false,
        cardStyle: styles.cardStyle,
    },
};

// Tab screen options preset
export const tabScreenOptions = {
    tabBarStyle: styles.tabBar,
    tabBarLabelStyle: styles.tabBarLabel,
    tabBarIconStyle: styles.tabBarIcon,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textSecondary,
    headerShown: false,
};

// Helper function to get icon name based on route and focus state
export const getTabBarIcon = (routeName, focused) => {
    const icons = {
        Dashboard: focused ? 'view-dashboard' : 'view-dashboard-outline',
        Budget: focused ? 'calculator' : 'calculator-variant-outline',
        Checklist: focused ? 'checkbox-marked-circle' : 'checkbox-marked-circle-outline',
        Resources: focused ? 'book-open-page-variant' : 'book-open-page-variant-outline',
        Profile: focused ? 'account' : 'account-outline',
    };

    return icons[routeName] || 'circle';
};