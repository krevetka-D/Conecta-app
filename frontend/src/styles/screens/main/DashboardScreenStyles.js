// frontend/src/styles/screens/main/DashboardScreenStyles.js

import { StyleSheet } from 'react-native';
import { colors, fonts, spacing, borderRadius, shadows } from '../../../constants/theme';

export const dashboardStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContentContainer: {
        flexGrow: 1,
        padding: spacing.md,
        width: '100%',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: colors.error,
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
        textAlign: 'center',
        padding: spacing.lg,
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
    },
    eventItem: {
        backgroundColor: colors.surface,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.sm,
    },
    eventTitle: {
        fontSize: fonts.sizes.lg,
        fontFamily: fonts.families.semiBold,
        color: colors.text,
    },
    eventDetails: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        marginTop: spacing.sm,
    },
});