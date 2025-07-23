// frontend/src/styles/screens/resources/ResourcesScreenStyles.js

import { StyleSheet } from 'react-native';

import { colors, fonts, spacing, borderRadius, shadows } from '../../../constants/theme';

export const resourcesStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    searchBar: {
        marginHorizontal: spacing.md,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
        elevation: 2,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.surface,
    },
    searchInput: {
        fontSize: fonts.sizes.md,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeTab: {
        backgroundColor: colors.primaryLight + '20',
        borderColor: colors.primary,
    },
    tabIcon: {
        marginRight: spacing.xs,
    },
    tabText: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
    },
    activeTabText: {
        fontFamily: fonts.families.semiBold,
        color: colors.primary,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl,
    },
    emptyListContent: {
        flex: 1,
    },
    separator: {
        height: spacing.sm,
    },
    emptyState: {
        paddingVertical: spacing.xxxl,
    },

    // Guide Styles
    guideCard: {
        borderRadius: borderRadius.lg,
        backgroundColor: colors.surface,
        ...shadows.sm,
    },
    guideContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    guideIconContainer: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    guideTextContainer: {
        flex: 1,
        marginRight: spacing.sm,
    },
    guideTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs / 2,
    },
    guideTitle: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.semiBold,
        color: colors.text,
        flex: 1,
        marginRight: spacing.xs,
    },
    guideDescription: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        lineHeight: fonts.sizes.sm * fonts.lineHeights.normal,
    },
    guideMetadata: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    categoryChip: {
        height: 24,
        backgroundColor: colors.background,
    },
    categoryChipText: {
        fontSize: fonts.sizes.xs,
        color: colors.primary,
    },
    newChip: {
        height: 20,
        backgroundColor: colors.success,
    },
    newChipText: {
        fontSize: fonts.sizes.xs,
        color: colors.surface,
        fontFamily: fonts.families.semiBold,
    },
    readTime: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
    },

    // Directory Styles
    directoryCard: {
        borderRadius: borderRadius.lg,
        backgroundColor: colors.surface,
        ...shadows.sm,
    },
    directoryHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    directoryIconContainer: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    directoryTitleContainer: {
        flex: 1,
    },
    directoryName: {
        fontSize: fonts.sizes.lg,
        fontFamily: fonts.families.semiBold,
        color: colors.text,
        marginBottom: spacing.xs / 2,
    },
    directoryBadges: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    directoryCategory: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.regular,
        color: colors.primary,
        textTransform: 'capitalize',
    },
    recommendedChip: {
        height: 22,
        backgroundColor: colors.accent,
    },
    recommendedText: {
        fontSize: fonts.sizes.xs,
        color: colors.surface,
        fontFamily: fonts.families.semiBold,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.warningLight + '20',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs / 2,
        borderRadius: borderRadius.md,
    },
    ratingText: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.semiBold,
        color: colors.warning,
        marginLeft: spacing.xs / 2,
    },
    directoryDescription: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        marginBottom: spacing.md,
        lineHeight: fonts.sizes.md * fonts.lineHeights.normal,
    },
    contactInfo: {
        gap: spacing.sm,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.xs,
    },
    contactText: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.regular,
        color: colors.primary,
        marginLeft: spacing.xs,
        flex: 1,
    },
});
