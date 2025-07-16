// src/styles/screens/main/DashboardScreenStyles.js
import { StyleSheet } from 'react-native';
import { colors, fonts, spacing, borderRadius, shadows } from '../../../constants/theme';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: spacing.xl,
    },
    header: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.lg,
        borderBottomLeftRadius: borderRadius.xl,
        borderBottomRightRadius: borderRadius.xl,
        ...shadows.md,
    },
    greeting: {
        fontSize: fonts.sizes.xxl,
        fontFamily: fonts.families.bold,
        color: colors.textInverse,
        marginBottom: spacing.xs,
    },
    subGreeting: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
        color: colors.textInverse,
        opacity: 0.9,
    },
    offlineBadge: {
        marginTop: spacing.sm,
        alignSelf: 'flex-start',
    },
    section: {
        padding: spacing.lg,
    },
    sectionTitle: {
        fontSize: fonts.sizes.lg,
        fontFamily: fonts.families.semiBold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    pinnedModules: {
        gap: spacing.sm,
    },
    pinnedCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
        ...shadows.sm,
    },
    pinnedCardIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        backgroundColor: colors.primaryLight + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    pinnedCardContent: {
        flex: 1,
    },
    pinnedCardTitle: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.semiBold,
        color: colors.text,
        marginBottom: spacing.xs / 2,
    },
    pinnedCardSubtitle: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
    },
    eventCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
        ...shadows.sm,
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    eventInfo: {
        flex: 1,
        marginRight: spacing.md,
    },
    eventTitle: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.semiBold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    eventDate: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.regular,
        color: colors.primary,
        marginBottom: spacing.xs / 2,
    },
    eventLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    eventLocation: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        marginLeft: spacing.xs / 2,
    },
    quickActions: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
    },
    actionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    actionButton: {
        width: '48%',
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    actionText: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.regular,
        color: colors.text,
        textAlign: 'center',
        marginTop: spacing.sm,
    },
    // Loading state
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    // Empty state
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    emptyText: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    // Statistics cards
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginHorizontal: spacing.xs,
        alignItems: 'center',
        ...shadows.sm,
    },
    statValue: {
        fontSize: fonts.sizes.xl,
        fontFamily: fonts.families.bold,
        color: colors.primary,
        marginBottom: spacing.xs / 2,
    },
    statLabel: {
        fontSize: fonts.sizes.xs,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    // Progress indicator
    progressContainer: {
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    progressTitle: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.semiBold,
        color: colors.text,
    },
    progressPercentage: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.semiBold,
        color: colors.primary,
    },
    progressBar: {
        height: 8,
        backgroundColor: colors.background,
        borderRadius: borderRadius.full,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: borderRadius.full,
    },
});