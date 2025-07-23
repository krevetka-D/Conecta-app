// src/styles/components/common/ErrorBoundaryStyles.js
import { StyleSheet } from 'react-native';

import { colors, fonts, spacing, borderRadius } from '../../../constants/theme';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    title: {
        fontSize: fonts.sizes.xxl,
        fontFamily: fonts.families.bold,
        color: colors.text,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    message: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: fonts.sizes.md * fonts.lineHeights.normal,
    },
    button: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.full,
    },
    buttonText: {
        color: colors.textInverse,
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.semiBold,
    },
    errorDetails: {
        marginTop: spacing.xl,
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        width: '100%',
    },
    errorTitle: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.semiBold,
        color: colors.error,
        marginBottom: spacing.sm,
    },
    errorText: {
        fontSize: fonts.sizes.xs,
        fontFamily: fonts.families.regular,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    errorStack: {
        fontSize: fonts.sizes.xs,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
    },
});
