// frontend/src/styles/screens/main/ProfileScreenStyles.js

import { StyleSheet } from 'react-native';
import { colors, fonts, spacing, borderRadius } from '../../../constants/theme';

export const profileStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    avatar: {
        backgroundColor: colors.primary,
        marginBottom: spacing.md,
    },
    name: {
        fontSize: fonts.sizes.h3,
        fontFamily: fonts.families.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    email: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    pathBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primaryLight + '20',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.pill,
    },
    pathText: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.semiBold,
        color: colors.primary,
        marginLeft: spacing.xs,
    },
    menuCard: {
        margin: spacing.md,
        borderRadius: borderRadius.lg,
    },
    menuItemTitle: {
        fontFamily: fonts.families.regular,
        fontSize: fonts.sizes.md,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
        paddingVertical: spacing.md,
    },
    logoutText: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.semiBold,
        color: colors.error,
        marginLeft: spacing.sm,
    },
    versionText: {
        fontSize: fonts.sizes.xs,
        fontFamily: fonts.families.regular,
        color: colors.textTertiary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
});