// src/styles/screens/auth/LoginScreen.js
import { StyleSheet } from 'react-native';
import { colors, fonts, spacing, borderRadius } from '../../../constants/theme';
export const loginStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
    },
    header: {
        marginBottom: spacing.xxl,
    },
    title: {
        fontSize: fonts.sizes.xxl,
        fontFamily: fonts.families.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
    },
    form: {
        width: '100%',
    },
    input: {
        marginBottom: spacing.md,
        backgroundColor: colors.surface,
    },
    button: {
        marginTop: spacing.xs,
        marginBottom: spacing.lg,
        borderRadius: borderRadius.full,
    },
    buttonContent: {
        paddingVertical: spacing.xs,
    },
    linkContainer: {
        alignItems: 'center',
    },
    linkText: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
    },
    linkBold: {
        fontFamily: fonts.families.semiBold,
        color: colors.primary,
    },
});