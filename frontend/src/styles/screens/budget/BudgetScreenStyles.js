// frontend/src/styles/screens/budget/BudgetScreenStyles.js

import { StyleSheet } from 'react-native';
import { colors, fonts, spacing, borderRadius, shadows } from '../../../constants/theme';

export const budgetStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingBottom: 80, // For FAB visibility
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: spacing.md,
        gap: spacing.sm,
    },
    summaryCard: {
        flex: 1,
        borderRadius: borderRadius.lg,
        elevation: 2,
    },
    incomeCard: {
        backgroundColor: `${colors.successLight}20`,
    },
    expenseCard: {
        backgroundColor: `${colors.errorLight}20`,
    },
    balanceCard: {
        backgroundColor: `${colors.primaryLight}20`,
    },
    summaryLabel: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    summaryAmount: {
        fontSize: fonts.sizes.lg,
        fontFamily: fonts.families.bold,
        textAlign: 'center',
    },
    positiveBalance: {
        color: colors.success,
    },
    negativeBalance: {
        color: colors.error,
    },
    entriesSection: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: fonts.sizes.lg,
        fontFamily: fonts.families.semiBold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    entryCard: {
        marginBottom: spacing.sm,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.surface,
        ...shadows.sm,
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    entryInfo: {
        flex: 1,
        marginRight: spacing.md,
    },
    entryCategory: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.semiBold,
        color: colors.text,
        marginBottom: spacing.xs / 2,
    },
    entryDescription: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    entryDate: {
        fontSize: fonts.sizes.xs,
        fontFamily: fonts.families.regular,
        color: colors.textTertiary,
    },
    entryAmount: {
        fontSize: fonts.sizes.lg,
        fontFamily: fonts.families.bold,
    },
    incomeAmount: {
        color: colors.success,
    },
    expenseAmount: {
        color: colors.error,
    },
    fab: {
        position: 'absolute',
        margin: spacing.md,
        right: 0,
        bottom: 0,
        backgroundColor: colors.primary,
    },
    modal: {
        backgroundColor: colors.surface,
        padding: spacing.lg,
        margin: spacing.lg,
        borderRadius: borderRadius.lg,
        maxHeight: '85%',
    },
    modalTitle: {
        fontSize: fonts.sizes.xl,
        fontFamily: fonts.families.bold,
        color: colors.text,
        marginBottom: spacing.lg,
    },
    radioGroup: {
        flexDirection: 'row',
        marginBottom: spacing.md,
        justifyContent: 'center',
    },
    input: {
        marginBottom: spacing.md,
        backgroundColor: colors.surface,
    },
    errorText: {
        color: colors.error,
        fontSize: fonts.sizes.sm,
        marginTop: -spacing.sm,
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
    },
    categorySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    categorySelectorText: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
        color: colors.text,
    },
    placeholderText: {
        color: colors.placeholder,
    },
    dateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    dateSelectorText: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
        color: colors.text,
        marginLeft: spacing.sm,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        gap: spacing.sm,
        paddingTop: spacing.sm,
    },
    modalButton: {
        flex: 1,
    },
    categoryOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    categoryOptionText: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
        color: colors.text,
    },
});