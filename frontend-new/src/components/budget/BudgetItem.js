import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const BudgetItem = ({ item }) => {
    const isIncome = item.type === 'income';
    const amountColor = isIncome ? COLORS.success : COLORS.error;
    const iconName = isIncome ? 'arrow-up-circle' : 'arrow-down-circle';
    const sign = isIncome ? '+' : '-';

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Ionicons name={iconName} size={30} color={amountColor} />
            </View>
            <View style={styles.detailsContainer}>
                <Text style={styles.description}>{item.description}</Text>
                <Text style={styles.category}>{item.category || 'General'}</Text>
            </View>
            <View style={styles.amountContainer}>
                <Text style={[styles.amount, { color: amountColor }]}>
                    {sign}€{item.amount.toFixed(2)}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SIZES.medium,
        backgroundColor: COLORS.white,
        borderRadius: SIZES.base,
        marginBottom: SIZES.small,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    iconContainer: {
        marginRight: SIZES.medium,
    },
    detailsContainer: {
        flex: 1, // Takes up the available space
    },
    description: {
        ...FONTS.h3,
        color: COLORS.black,
    },
    category: {
        ...FONTS.body,
        color: COLORS.gray,
    },
    amountContainer: {
        marginLeft: SIZES.medium,
    },
    amount: {
        ...FONTS.h3,
        fontWeight: 'bold',
    },
});

export default BudgetItem;