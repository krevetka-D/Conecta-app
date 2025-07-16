// src/styles/components/ui/ButtonStyles.js
import { StyleSheet } from 'react-native';
import { colors, fonts, spacing, borderRadius } from '../../../constants/theme';

export const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.lg,
    },

    // Variants
    primary: {
        backgroundColor: colors.primary,
    },
    secondary: {
        backgroundColor: colors.secondary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    danger: {
        backgroundColor: colors.error,
    },

    // Sizes
    small: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    medium: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    large: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
    },

    // States
    disabled: {
        opacity: 0.5,
    },
    fullWidth: {
        width: '100%',
    },

    // Content
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    // Text styles
    text: {
        fontFamily: fonts.families.semiBold,
        textAlign: 'center',
    },
    primaryText: {
        color: colors.textInverse,
    },
    secondaryText: {
        color: colors.textInverse,
    },
    outlineText: {
        color: colors.primary,
    },
    ghostText: {
        color: colors.primary,
    },
    dangerText: {
        color: colors.textInverse,
    },
    disabledText: {
        color: colors.disabled,
    },

    // Text sizes
    smallText: {
        fontSize: fonts.sizes.sm,
    },
    mediumText: {
        fontSize: fonts.sizes.md,
    },
    largeText: {
        fontSize: fonts.sizes.lg,
    },

    // Icons
    iconLeft: {
        marginRight: spacing.sm,
    },
    iconRight: {
        marginLeft: spacing.sm,
    },
});