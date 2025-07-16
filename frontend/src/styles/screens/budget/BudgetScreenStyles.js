// src/styles/screens/budget/BudgetScreenStyles.js
import { StyleSheet } from 'react-native';
import { colors, fonts } from '../../../constants/theme';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        gap: 8,
    },
    summaryCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    incomeCard: {
        backgroundColor: colors.successLight + '20',
    },
    expenseCard: {
        backgroundColor: colors.errorLight + '20',
    },
    balanceCard: {
        backgroundColor: colors.primaryLight + '20',
    },
    summaryLabel: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    summaryAmount: {
        fontSize: fonts.sizes.lg,
        fontFamily: fonts.families.bold,
        color: colors.text,
    },
    positiveBalance: {
        color: colors.success,
    },
    negativeBalance: {
        color: colors.error,
    },
    entriesSection: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: fonts.sizes.lg,
        fontFamily: fonts.families.semiBold,
        color: colors.text,
        marginBottom: 16,
    },
    entryCard: {
        marginBottom: 12,
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    entryInfo: {
        flex: 1,
    },
    entryCategory: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.semiBold,
        color: colors.text,
    },
    entryDescription: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        marginTop: 2,
    },
    entryDate: {
        fontSize: fonts.sizes.xs,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        marginTop: 4,
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
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: colors.primary,
    },
    modal: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 12,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: fonts.sizes.xl,
        fontFamily: fonts.families.bold,
        color: colors.text,
        marginBottom: 20,
    },
    radioGroup: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    input: {
        marginBottom: 16,
    },
    errorText: {
        color: colors.error,
        fontSize: fonts.sizes.sm,
        marginTop: -12,
        marginBottom: 8,
        marginLeft: 4,
    },
    categorySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
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
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
    },
    dateSelectorText: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
        color: colors.text,
        marginLeft: 12,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    modalButton: {
        flex: 1,
    },
});
