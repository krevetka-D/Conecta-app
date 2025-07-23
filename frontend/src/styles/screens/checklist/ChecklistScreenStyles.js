// frontend/src/styles/screens/checklist/ChecklistScreenStyles.js

import { StyleSheet } from 'react-native';

import { colors, fonts, spacing, borderRadius, shadows } from '../../../constants/theme';

export const checklistStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingBottom: spacing.xxl,
    },
    progressSection: {
        padding: spacing.lg,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        ...shadows.sm,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    progressTitle: {
        fontSize: fonts.sizes.xxl,
        fontFamily: fonts.families.bold,
        color: colors.text,
    },
    progressPercentage: {
        fontSize: fonts.sizes.xl,
        fontFamily: fonts.families.bold,
        color: colors.primary,
    },
    progressText: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    progressBar: {
        height: 8,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.background,
    },
    motivationalText: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.semiBold,
        color: colors.primary,
        marginTop: spacing.sm,
        textAlign: 'center',
    },
    checklistSection: {
        padding: spacing.lg,
    },
    checklistCard: {
        marginBottom: spacing.sm,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        ...shadows.sm,
    },
    firstCard: {
        marginTop: 0,
    },
    lastCard: {
        marginBottom: 0,
    },
    completedCard: {
        opacity: 0.8,
        backgroundColor: colors.surfaceVariant,
    },
    cardTouchable: {
        width: '100%',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    checkboxContainer: {
        marginRight: spacing.sm,
    },
    loadingCheckbox: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTextContainer: {
        flex: 1,
        marginRight: spacing.sm,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs / 2,
    },
    itemIcon: {
        marginRight: spacing.xs,
    },
    cardTitle: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.semiBold,
        color: colors.text,
        flex: 1,
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: colors.textSecondary,
    },
    cardDescription: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        lineHeight: fonts.sizes.sm * fonts.lineHeights.normal,
    },
    completedDescription: {
        color: colors.textTertiary,
    },
    infoButton: {
        padding: spacing.xs,
    },
    tipsSection: {
        padding: spacing.lg,
        paddingTop: 0,
    },
    tipCard: {
        borderRadius: borderRadius.lg,
        backgroundColor: '#FEF3C7',
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    tipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    tipTitle: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.semiBold,
        color: colors.text,
        marginLeft: spacing.sm,
    },
    tipText: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.regular,
        color: colors.text,
        lineHeight: fonts.sizes.sm * fonts.lineHeights.relaxed,
    },
    resourceCard: {
        borderRadius: borderRadius.lg,
        backgroundColor: colors.surface,
        ...shadows.sm,
    },
    resourceTouchable: {
        width: '100%',
    },
    resourceContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resourceTextContainer: {
        flex: 1,
        marginLeft: spacing.md,
    },
    resourceTitle: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.semiBold,
        color: colors.text,
    },
    resourceDescription: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        marginTop: spacing.xs / 2,
    },
    // Empty state styles
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    emptyTitle: {
        fontSize: fonts.sizes.xl,
        fontFamily: fonts.families.semiBold,
        color: colors.text,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },
    emptyText: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: fonts.sizes.md * fonts.lineHeights.normal,
    },
    emptyStateButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.full,
    },
    emptyStateButtonText: {
        color: colors.textInverse,
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.semiBold,
    },
});
