import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Platform,
    RefreshControl,
    ActivityIndicator,
    ScrollView, // Add ScrollView back to the imports
} from 'react-native';
import { FAB, Portal, Modal, TextInput, RadioButton, Provider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../store/contexts/AuthContext';
import { useApi } from '../../hooks/useApi';
import { useForm } from '../../hooks/useForm';
import { showErrorAlert, showSuccessAlert } from '../../utils/alerts';
import { formatCurrency } from '../../utils/formatting';
import { styles } from '../../styles/screens/budget/BudgetScreenStyles';
import { colors } from '../../constants/theme';
import { BUDGET_CATEGORIES, PROFESSIONAL_PATHS } from '../../constants/config';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../constants/messages';
import budgetService from '../../services/budgetService';

// --- Header Component for the FlatList ---
const BudgetListHeader = ({ totals }) => (
    <>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
            <Card style={[styles.summaryCard, styles.incomeCard]}>
                <Text style={styles.summaryLabel}>Income</Text>
                <Text style={styles.summaryAmount}>{formatCurrency(totals.income)}</Text>
            </Card>
            <Card style={[styles.summaryCard, styles.expenseCard]}>
                <Text style={styles.summaryLabel}>Expenses</Text>
                <Text style={styles.summaryAmount}>{formatCurrency(totals.expenses)}</Text>
            </Card>
            <Card style={[styles.summaryCard, styles.balanceCard]}>
                <Text style={styles.summaryLabel}>Balance</Text>
                <Text style={[styles.summaryAmount, totals.balance >= 0 ? styles.positiveBalance : styles.negativeBalance]}>
                    {formatCurrency(totals.balance)}
                </Text>
            </Card>
        </View>
        {/* Entries List Title */}
        <View style={styles.entriesSection}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
        </View>
    </>
);

// --- List Item Component ---
const EntryItem = ({ item }) => (
    <Card style={[styles.entryCard, { marginHorizontal: 16 }]}>
        <View style={styles.entryHeader}>
            <View style={styles.entryInfo}>
                <Text style={styles.entryCategory}>{item.category}</Text>
                {item.description ? <Text style={styles.entryDescription}>{item.description}</Text> : null}
                <Text style={styles.entryDate}>{format(new Date(item.entryDate), 'MMM d, yyyy')}</Text>
            </View>
            <Text style={[styles.entryAmount, item.type === 'INCOME' ? styles.incomeAmount : styles.expenseAmount]}>
                {item.type === 'INCOME' ? '+' : '-'}{formatCurrency(item.amount)}
            </Text>
        </View>
    </Card>
);

const BudgetScreen = () => {
    const { user } = useAuth();
    const [entries, setEntries] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const { execute: loadEntries, loading } = useApi(budgetService.getBudgetEntries);
    const { execute: createEntry, loading: creating } = useApi(budgetService.createBudgetEntry);
    const { execute: deleteEntry } = useApi(budgetService.deleteBudgetEntry);

    const { values, errors, handleChange, validateForm, resetForm, setValues } = useForm({
        initialValues: { type: 'INCOME', category: '', amount: '', description: '', entryDate: new Date() },
        validationRules: {
            category: (value) => !value ? 'Category is required' : null,
            amount: (value) => {
                if (!value) return 'Amount is required';
                if (isNaN(value) || parseFloat(value) <= 0) return 'Invalid amount';
                return null;
            },
        },
    });

    const loadBudgetEntries = useCallback(async () => {
        try {
            const data = await loadEntries();
            setEntries(data);
        } catch (error) {
            showErrorAlert('Error', ERROR_MESSAGES.GENERIC_ERROR);
        }
    }, [loadEntries]);

    useEffect(() => {
        loadBudgetEntries();
    }, [loadBudgetEntries]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadBudgetEntries();
        setRefreshing(false);
    }, [loadBudgetEntries]);

    const handleAddEntry = useCallback(async () => {
        if (!validateForm()) return;
        try {
            const entry = { ...values, amount: parseFloat(values.amount), entryDate: values.entryDate.toISOString() };
            await createEntry(entry);
            await loadBudgetEntries();
            showSuccessAlert('Success', SUCCESS_MESSAGES.ENTRY_ADDED);
            setModalVisible(false);
            resetForm();
        } catch (error) {
            showErrorAlert('Error', ERROR_MESSAGES.BUDGET_ENTRY_FAILED);
        }
    }, [values, validateForm, createEntry, loadBudgetEntries, resetForm]);

    const handleDateChange = useCallback((event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setValues(prev => ({ ...prev, entryDate: selectedDate }));
        }
    }, [setValues]);

    const totals = useMemo(() => {
        const income = entries.filter(e => e.type === 'INCOME').reduce((sum, e) => sum + e.amount, 0);
        const expenses = entries.filter(e => e.type === 'EXPENSE').reduce((sum, e) => sum + e.amount, 0);
        return { income, expenses, balance: income - expenses };
    }, [entries]);

    return (
        <Provider>
            <View style={styles.container}>
                <FlatList
                    data={entries}
                    renderItem={({ item }) => <EntryItem item={item} />}
                    keyExtractor={(item) => item._id}
                    ListHeaderComponent={<BudgetListHeader totals={totals} />}
                    ListEmptyComponent={
                        <View style={{padding: 20, alignItems: 'center'}}>
                            <Icon name="cash-remove" size={48} color={colors.textSecondary} />
                            <Text style={[styles.sectionTitle, {marginTop: 16}]}>No transactions yet</Text>
                            <Text style={{color: colors.textSecondary}}>Add your first income or expense!</Text>
                        </View>
                    }
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
                    }
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                />

                <FAB icon="plus" style={styles.fab} onPress={() => setModalVisible(true)} />

                <Portal>
                    <Modal visible={modalVisible} onDismiss={() => { setModalVisible(false); resetForm(); }} contentContainerStyle={styles.modal}>
                        <ScrollView>
                            <Text style={styles.modalTitle}>Add Transaction</Text>
                            <RadioButton.Group onValueChange={handleChange('type')} value={values.type}>
                                <View style={styles.radioGroup}>
                                    <RadioButton.Item label="Income" value="INCOME" />
                                    <RadioButton.Item label="Expense" value="EXPENSE" />
                                </View>
                            </RadioButton.Group>
                            <TextInput label="Amount" value={values.amount} onChangeText={handleChange('amount')} keyboardType="decimal-pad" mode="outlined" style={styles.input} left={<TextInput.Affix text="€" />} error={!!errors.amount} />
                            {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
                            <TouchableOpacity style={styles.categorySelector}>
                                <Text style={[styles.categorySelectorText, !values.category && styles.placeholderText]}>
                                    {values.category || 'Select Category *'}
                                </Text>
                                <Icon name="chevron-down" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                            {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
                            <TextInput label="Description (optional)" value={values.description} onChangeText={handleChange('description')} mode="outlined" style={styles.input} multiline numberOfLines={3} />
                            <TouchableOpacity style={styles.dateSelector} onPress={() => setShowDatePicker(true)}>
                                <Icon name="calendar" size={24} color={colors.primary} />
                                <Text style={styles.dateSelectorText}>{format(values.entryDate, 'MMMM d, yyyy')}</Text>
                            </TouchableOpacity>
                            {showDatePicker && <DateTimePicker value={values.entryDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={handleDateChange} maximumDate={new Date()} />}
                            <View style={styles.modalButtons}>
                                <Button title="Cancel" onPress={() => { resetForm(); setModalVisible(false); }} variant="outline" style={styles.modalButton} />
                                <Button title="Add Entry" onPress={handleAddEntry} loading={creating} disabled={creating} style={styles.modalButton} />
                            </View>
                        </ScrollView>
                    </Modal>
                </Portal>
            </View>
        </Provider>
    );
};

export default React.memo(BudgetScreen);