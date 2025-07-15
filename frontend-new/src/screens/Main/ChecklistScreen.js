import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchChecklist } from '../../app/slices/checklistSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

// You would create this component to display a single checklist item
// import ChecklistItem from '../../components/checklist/ChecklistItem';

const ChecklistScreen = () => {
    const dispatch = useDispatch();
    const { items, loading } = useSelector((state) => state.checklist);
    const { userRole } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(fetchChecklist());
    }, [dispatch]);

    if (loading) {
        return <LoadingSpinner />;
    }

    const checklistTitle = userRole === 'freelancer' ? "Freelancer's Checklist" : "Founder's Checklist";

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>{checklistTitle}</Text>
            <FlatList
                data={items}
                keyExtractor={(item) => item._id}
                // renderItem={({ item }) => <ChecklistItem item={item} />}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <Text style={item.isCompleted ? styles.itemTextCompleted : styles.itemText}>
                            {item.task}
                        </Text>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Your checklist is empty.</Text>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: SIZES.medium,
        backgroundColor: COLORS.white,
    },
    title: {
        ...FONTS.h1,
        marginBottom: SIZES.large
    },
    itemContainer: {
        paddingVertical: SIZES.medium,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    itemText: {
        ...FONTS.body,
        fontSize: SIZES.medium,
    },
    itemTextCompleted: {
        ...FONTS.body,
        fontSize: SIZES.medium,
        color: COLORS.gray,
        textDecorationLine: 'line-through'
    },
    emptyText: {
        ...FONTS.body,
        color: COLORS.gray,
        textAlign: 'center',
        marginTop: SIZES.xlarge
    }
});

export default ChecklistScreen;