import { StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../../../constants/theme';

export const publicProfileStyles = (theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        errorContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.xl,
        },
        errorText: {
            fontSize: fonts.sizes.lg,
            color: theme.colors.textSecondary,
            textAlign: 'center',
        },
        headerSection: {
            alignItems: 'center',
            padding: spacing.xl,
            backgroundColor: theme.colors.surface,
        },
        avatar: {
            backgroundColor: theme.colors.primary,
            marginBottom: spacing.md,
        },
        userName: {
            fontSize: fonts.sizes.xxl,
            fontWeight: fonts.weights.bold,
            color: theme.colors.text,
            marginBottom: spacing.xs,
        },
        userEmail: {
            fontSize: fonts.sizes.md,
            color: theme.colors.textSecondary,
            marginBottom: spacing.md,
        },
        professionalBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.primaryLight,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: 20,
            marginBottom: spacing.md,
        },
        professionalText: {
            marginLeft: spacing.sm,
            fontSize: fonts.sizes.md,
            color: theme.colors.primary,
            fontWeight: fonts.weights.medium,
        },
        bio: {
            fontSize: fonts.sizes.md,
            color: theme.colors.text,
            textAlign: 'center',
            paddingHorizontal: spacing.xl,
            marginTop: spacing.sm,
        },
        statsCard: {
            margin: spacing.md,
            elevation: 2,
        },
        statsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
        },
        statItem: {
            flex: 1,
            alignItems: 'center',
        },
        statValue: {
            fontSize: fonts.sizes.xl,
            fontWeight: fonts.weights.bold,
            color: theme.colors.primary,
            marginBottom: spacing.xs,
        },
        statLabel: {
            fontSize: fonts.sizes.sm,
            color: theme.colors.textSecondary,
        },
        statDivider: {
            width: 1,
            height: 40,
            backgroundColor: theme.colors.border,
        },
        interestsCard: {
            margin: spacing.md,
            marginTop: 0,
            elevation: 2,
        },
        skillsCard: {
            margin: spacing.md,
            marginTop: 0,
            elevation: 2,
        },
        chipsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: spacing.sm,
        },
        interestChip: {
            margin: spacing.xs,
            backgroundColor: theme.colors.secondaryLight,
        },
        skillChip: {
            margin: spacing.xs,
            backgroundColor: theme.colors.primaryLight,
        },
        chipText: {
            fontSize: fonts.sizes.sm,
            color: theme.colors.text,
        },
        actionButtons: {
            padding: spacing.xl,
            paddingTop: spacing.md,
        },
        chatButton: {
            paddingVertical: spacing.sm,
        },
        editButton: {
            paddingVertical: spacing.sm,
            borderColor: theme.colors.primary,
        },
    });