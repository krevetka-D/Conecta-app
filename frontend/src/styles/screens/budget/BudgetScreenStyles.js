// frontend/src/styles/screens/budget/BudgetScreenStyles.js

import { StyleSheet, Platform } from 'react-native';
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
        paddingBottom: 100, // For FAB visibility
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.lg,
        flexWrap: 'wrap',
    },
    summaryCardContainer: {
        width: '31%',
        minWidth: 100,
        marginBottom: spacing.sm,
        borderRadius: borderRadius.md,
        ...shadows.md,
        backgroundColor: colors.surface,
    },
    summaryCardContent: {
        borderRadius: borderRadius.md,
        overflow: 'hidden',
    },
    summaryCard: {
        margin: 0,
        elevation: 0,
        backgroundColor: 'transparent',
    },
    summaryCardInner: {
        padding: spacing.md,
        alignItems: 'center',
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
    incomeAmountColor: {
        color: colors.success,
    },
    expenseAmountColor: {
        color: colors.error,
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
    entryCardContainer: {
        marginBottom: spacing.sm,
        borderRadius: borderRadius.md,
        ...shadows.sm,
        backgroundColor: colors.surface,
    },
    entryCardContent: {
        borderRadius: borderRadius.md,
        overflow: 'hidden',
    },
    entryCard: {
        margin: 0,
        elevation: 0,
        backgroundColor: 'transparent',
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
        zIndex: 1, // Reduced from 100
        elevation: 8,
    },
    modalContainer: {
        backgroundColor: colors.surface,
        margin: spacing.lg,
        borderRadius: borderRadius.lg,
        maxHeight: '85%',
        zIndex: 1000, // Increased from 9999
        elevation: 24, // Increased from 999
        ...Platform.select({
            ios: {
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
            },
            android: {
                elevation: 24,
            },
        }),
    },
    categoryModalContainer: {
        maxHeight: '50%',
        zIndex: 2000, // Increased from 10000
        elevation: 25, // Increased from 1000
    },
    modalContent: {
        padding: spacing.lg,
    },
    modalTitle: {
        fontSize: fonts.sizes.xl,
        fontFamily: fonts.families.bold,
        color: colors.text,
        marginBottom: spacing.lg,
        textAlign: 'center',
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
        marginBottom: spacing.md,
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
        backgroundColor: colors.surface,
    },
    categorySelectorError: {
        borderColor: colors.error,
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
        backgroundColor: colors.surface,
    },
    dateSelectorText: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
        color: colors.text,
        marginLeft: spacing.sm,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.md,
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
    // Date Picker Styles
    datePickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    datePickerContent: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: borderRadius.lg,
        borderTopRightRadius: borderRadius.lg,
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    datePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    datePickerCancel: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
        color: colors.error,
    },
    datePickerTitle: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.semiBold,
        color: colors.text,
    },
    datePickerDone: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.semiBold,
        color: colors.primary,
    },
    datePicker: {
        width: '100%',
        backgroundColor: colors.surface,
    },
    // Modal Overlay Style
    modalOverlay: {
        zIndex: 999, // Reduced from 9998
        elevation: 23, // Reduced from 998
    },
    categoryScrollView: {
        maxHeight: 300,
    },
});