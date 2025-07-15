import React, { useEffect } from 'react';
import { StyleSheet, SafeAreaView, FlatList, View, Text } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBudget } from '../../app/slices/budgetSlice';
import BudgetSummary from '../../components/budget/BudgetSummary';
import BudgetItem from '../../components/budget/BudgetItem';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const BudgetScreen = () => {
    const dispatch = useDispatch();
    const { items, loading, error } = useSelector((state) => state.budget);

    useEffect(() => {
        // Fetch budget data when the screen is opened
        dispatch(fetchBudget());
    }, [dispatch]);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={items}
                keyExtractor={(item) => item._id}
                ListHeaderComponent={
                    <>
                        <Text style={styles.title}>Budget Planner</Text>
                        <BudgetSummary items={items} />
                        <Text style={styles.subtitle}>Recent Transactions</Text>
                    </>
                }
                renderItem={({ item }) => <BudgetItem item={item} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No budget items found.</Text>
                        <Text style={styles.emptyText}>Add your first income or expense!</Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
    },
    listContent: {
        padding: SIZES.medium,
    },
    title: {
        ...FONTS.h1,
        marginBottom: SIZES.medium,
    },
    subtitle: {
        ...FONTS.h3,
        marginTop: SIZES.medium,
        marginBottom: SIZES.small,
    },
    emptyContainer: {
        marginTop: SIZES.xlarge,
        alignItems: 'center'
    },
    emptyText: {
        ...FONTS.body,
        color: COLORS.gray
    }
});

export default BudgetScreen;