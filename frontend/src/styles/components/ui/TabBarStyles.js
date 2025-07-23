// src/styles/components/ui/TabBarStyles.js
import { StyleSheet } from 'react-native';

import { colors, fonts, spacing, borderRadius } from '../../../constants/theme';

export const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
    },
    scrollContainer: {
        paddingHorizontal: spacing.md,
    },

    // Default variant
    defaultContainer: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    defaultTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
    },
    defaultActiveTab: {
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
    },
    defaultText: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
    },
    defaultActiveText: {
        color: colors.primary,
        fontFamily: fonts.families.semiBold,
    },

    // Pills variant
    pillsContainer: {
        padding: spacing.xs,
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
    },
    pillsTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        marginHorizontal: spacing.xs,
        borderRadius: borderRadius.md,
    },
    pillsActiveTab: {
        backgroundColor: colors.surface,
    },
    pillsText: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
    },
    pillsActiveText: {
        color: colors.primary,
        fontFamily: fonts.families.semiBold,
    },

    // Underline variant
    underlineContainer: {
        backgroundColor: 'transparent',
    },
    underlineTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        position: 'relative',
    },
    underlineActiveTab: {
        // Active state handled by indicator
    },
    underlineText: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
    },
    underlineActiveText: {
        color: colors.primary,
        fontFamily: fonts.families.semiBold,
    },

    // Common elements
    tab: {
        minHeight: 48,
    },
    text: {
        marginHorizontal: spacing.xs,
    },
    icon: {
        marginRight: spacing.xs,
    },
    indicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.full,
    },
    badge: {
        backgroundColor: colors.error,
        borderRadius: borderRadius.full,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: spacing.xs,
        paddingHorizontal: spacing.xs,
    },
    badgeHidden: {
        display: 'none',
    },
    badgeText: {
        fontSize: fonts.sizes.xs,
        fontFamily: fonts.families.semiBold,
        color: colors.textInverse,
    },
});
