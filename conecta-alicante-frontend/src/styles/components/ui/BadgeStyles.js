// src/styles/components/ui/BadgeStyles.js
import { StyleSheet } from 'react-native';
import { colors, fonts, spacing, borderRadius } from '../../../constants/theme';

export const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: borderRadius.full,
        alignSelf: 'flex-start',
    },

    // Variants
    default: {
        backgroundColor: colors.background,
    },
    primary: {
        backgroundColor: colors.primaryLight + '20',
    },
    secondary: {
        backgroundColor: colors.secondaryLight + '20',
    },
    success: {
        backgroundColor: colors.successLight + '20',
    },
    warning: {
        backgroundColor: colors.warningLight + '20',
    },
    error: {
        backgroundColor: colors.errorLight + '20',
    },
    info: {
        backgroundColor: colors.infoLight + '20',
    },

    // Sizes
    small: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
    medium: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm - 2,
    },
    large: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
    },

    // Text styles
    text: {
        fontFamily: fonts.families.semiBold,
    },
    defaultText: {
        color: colors.text,
    },
    primaryText: {
        color: colors.primary,
    },
    secondaryText: {
        color: colors.secondary,
    },
    successText: {
        color: colors.success,
    },
    warningText: {
        color: colors.warning,
    },
    errorText: {
        color: colors.error,
    },
    infoText: {
        color: colors.info,
    },

    // Text sizes
    smallText: {
        fontSize: fonts.sizes.xs,
    },
    mediumText: {
        fontSize: fonts.sizes.sm,
    },
    largeText: {
        fontSize: fonts.sizes.md,
    },

    // Icon
    icon: {
        marginRight: spacing.xs,
    },
});