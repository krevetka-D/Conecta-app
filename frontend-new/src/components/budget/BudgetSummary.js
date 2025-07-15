import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const BudgetSummary = ({ items = [] }) => {
    // Calculate total income and expenses from the budget items
    const totalIncome = items
        .filter(item => item.type === 'income')
        .reduce((sum, item) => sum + item.amount, 0);

    const totalExpenses = items
        .filter(item => item.type === 'expense')
        .reduce((sum, item) => sum + item.amount, 0);

    const balance = totalIncome - totalExpenses;

    return (
        <View style={styles.container}>
            {/* Balance Card */}
            <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Current Balance</Text>
                <Text style={styles.balanceAmount}>€{balance.toFixed(2)}</Text>
            </View>

            {/* Income and Expense Cards */}
            <View style={styles.summaryContainer}>
                <View style={[styles.summaryCard, styles.incomeCard]}>
                    <Text style={styles.summaryLabel}>Income</Text>
                    <Text style={styles.summaryAmount}>€{totalIncome.toFixed(2)}</Text>
                </View>
                <View style={[styles.summaryCard, styles.expenseCard]}>
                    <Text style={styles.summaryLabel}>Expenses</Text>
                    <Text style={styles.summaryAmount}>-€{totalExpenses.toFixed(2)}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SIZES.large,
    },
    balanceCard: {
        backgroundColor: COLORS.primary,
        padding: SIZES.large,
        borderRadius: SIZES.medium,
        alignItems: 'center',
        marginBottom: SIZES.medium,
    },
    balanceLabel: {
        ...FONTS.body,
        color: COLORS.white,
        opacity: 0.8,
    },
    balanceAmount: {
        ...FONTS.h1,
        color: COLORS.white,
        fontSize: 36, // Larger font for emphasis
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryCard: {
        flex: 1,
        padding: SIZES.medium,
        borderRadius: SIZES.base,
        alignItems: 'center',
    },
    incomeCard: {
        backgroundColor: COLORS.success,
        marginRight: SIZES.small,
    },
    expenseCard: {
        backgroundColor: COLORS.error,
        marginLeft: SIZES.small,
    },
    summaryLabel: {
        ...FONTS.h3,
        color: COLORS.white,
        marginBottom: SIZES.base,
    },
    summaryAmount: {
        ...FONTS.body,
        color: COLORS.white,
        fontWeight: 'bold',
    },
});

export default BudgetSummary;