import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    SafeAreaView,
    Platform,
} from 'react-native';
import { Card, FAB, Portal, Modal, TextInput, RadioButton, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../store/contexts/AuthContext';
import { colors, fonts, spacing, borderRadius, shadows } from '../../constants/theme';
import budgetService from '../../services/budgetService';
import { showErrorAlert, showSuccessAlert, showConfirmAlert } from '../../utils/alerts';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../constants/messages';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatting';

const BudgetScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [categories, setCategories] = useState({ income: [], expense: [] });

    // Form state
    const [formData, setFormData] = useState({
        type: 'EXPENSE',
        category: '',
        amount: '',
        description: '',
        entryDate: new Date(),
    });

    const [formErrors, setFormErrors] = useState({});

    // Load budget categories only when the user's professional path is available.
    useEffect(() => {
        loadCategories(user?.professionalPath || 'FREELANCER');
    }, [user?.professionalPath]);
    // Load budget entries on initial component mount
    useEffect(() => {
        loadBudgetEntries();
    }, []);

    const loadCategories = async (professionalPath = 'FREELANCER') => {
        try {
            console.log('Loading categories for path:', professionalPath);
            const response = await budgetService.getCategories(professionalPath);
            console.log('Categories loaded:', response);

            // Ensure we have valid categories
            if (response && (response.income || response.expense)) {
                setCategories({
                    income: response.income || [],
                    expense: response.expense || []
                });
            } else {
                // Use default categories if response is invalid
                throw new Error('Invalid categories response');
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
            // Fallback to default categories as a safety measure
            const defaultCategories = professionalPath === 'ENTREPRENEUR'
                ? {
                    income: ['Product Sales', 'Service Revenue', 'Investor Funding', 'Grants', 'Other Income'],
                    expense: ['Salaries & Payroll', 'Office Rent', 'Legal & Accounting', 'Marketing & Sales', 'R&D', 'Operations', 'Other Expenses']
                }
                : {
                    income: ['Project-Based Income', 'Recurring Clients', 'Passive Income', 'Other Income'],
                    expense: ['Cuota de Autónomo', 'Office/Coworking', 'Software & Tools', 'Professional Services', 'Marketing', 'Travel & Transport', 'Other Expenses']
                };
            setCategories(defaultCategories);
        }
    };

    const loadBudgetEntries = useCallback(async () => {
        try {
            setLoading(true);
            const data = await budgetService.getBudgetEntries();
            setEntries(data || []);
        } catch (error) {
            console.error('Failed to load budget entries:', error);
            if (!refreshing) {
                showErrorAlert('Error', ERROR_MESSAGES.BUDGET_LOAD_FAILED);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [refreshing]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadBudgetEntries();
        if (user?.professionalPath) {
            loadCategories(user.professionalPath);
        }
    }, [loadBudgetEntries, user?.professionalPath]);

    const validateForm = () => {
        const errors = {};
        if (!formData.category) errors.category = 'Please select a category';
        if (!formData.amount || parseFloat(formData.amount) <= 0) errors.amount = 'Please enter a valid amount';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        try {
            const entryData = { ...formData, amount: parseFloat(formData.amount) };
            await budgetService.createBudgetEntry(entryData);
            showSuccessAlert('Success', SUCCESS_MESSAGES.ENTRY_ADDED);
            setModalVisible(false);
            resetForm();
            loadBudgetEntries();
        } catch (error) {
            console.error('Failed to add budget entry:', error);
            showErrorAlert('Error', ERROR_MESSAGES.BUDGET_ENTRY_FAILED);
        }
    };

    const handleDelete = (entryId) => {
        showConfirmAlert('Delete Entry', 'Are you sure?', async () => {
            try {
                await budgetService.deleteBudgetEntry(entryId);
                showSuccessAlert('Success', SUCCESS_MESSAGES.ENTRY_DELETED);
                loadBudgetEntries();
            } catch (error) {
                console.error('Failed to delete entry:', error);
                showErrorAlert('Error', ERROR_MESSAGES.BUDGET_DELETE_FAILED);
            }
        });
    };

    const resetForm = () => {
        setFormData({ type: 'EXPENSE', category: '', amount: '', description: '', entryDate: new Date() });
        setFormErrors({});
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setFormData({ ...formData, entryDate: selectedDate });
        }
    };

    const calculateSummary = () => {
        const income = entries.filter(e => e.type === 'INCOME').reduce((sum, e) => sum + e.amount, 0);
        const expenses = entries.filter(e => e.type === 'EXPENSE').reduce((sum, e) => sum + e.amount, 0);
        return { income, expenses, balance: income - expenses };
    };

    if (loading && !refreshing) {
        return <LoadingSpinner fullScreen text="Loading your budget..." />;
    }

    const { income, expenses, balance } = calculateSummary();

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Summary Cards */}
                <View style={styles.summaryContainer}>
                    <Card style={[styles.summaryCard, styles.incomeCard]}>
                        <Card.Content>
                            <Text style={styles.summaryLabel}>Income</Text>
                            <Text style={[styles.summaryAmount, { color: colors.success }]}>{formatCurrency(income)}</Text>
                        </Card.Content>
                    </Card>
                    <Card style={[styles.summaryCard, styles.expenseCard]}>
                        <Card.Content>
                            <Text style={styles.summaryLabel}>Expenses</Text>
                            <Text style={[styles.summaryAmount, { color: colors.error }]}>{formatCurrency(expenses)}</Text>
                        </Card.Content>
                    </Card>
                    <Card style={[styles.summaryCard, styles.balanceCard]}>
                        <Card.Content>
                            <Text style={styles.summaryLabel}>Balance</Text>
                            <Text style={[styles.summaryAmount, balance >= 0 ? styles.positiveBalance : styles.negativeBalance]}>{formatCurrency(balance)}</Text>
                        </Card.Content>
                    </Card>
                </View>

                {/* Entries List */}
                <View style={styles.entriesSection}>
                    <Text style={styles.sectionTitle}>Recent Transactions</Text>
                    {entries.length === 0 ? (
                        <EmptyState icon="cash-remove" title="No transactions yet" message="Add your first entry to get started" action={<Button mode="contained" onPress={() => setModalVisible(true)} icon="plus">Add Entry</Button>} />
                    ) : (
                        entries.map((entry) => (
                            <Card key={entry._id} style={styles.entryCard}>
                                <Card.Content>
                                    <View style={styles.entryHeader}>
                                        <View style={styles.entryInfo}>
                                            <Text style={styles.entryCategory}>{entry.category}</Text>
                                            {entry.description && <Text style={styles.entryDescription}>{entry.description}</Text>}
                                            <Text style={styles.entryDate}>{formatDate(entry.entryDate)}</Text>
                                        </View>
                                        <Text style={[styles.entryAmount, entry.type === 'INCOME' ? styles.incomeAmount : styles.expenseAmount]}>
                                            {entry.type === 'INCOME' ? '+' : '-'}{formatCurrency(entry.amount)}
                                        </Text>
                                    </View>
                                </Card.Content>
                                <Card.Actions><Button onPress={() => handleDelete(entry._id)} textColor={colors.error}>Delete</Button></Card.Actions>
                            </Card>
                        ))
                    )}
                </View>
            </ScrollView>

            <FAB icon="plus" style={styles.fab} onPress={() => setModalVisible(true)} />

            {/* Add/Edit Entry Modal */}
            <Portal>
                <Modal visible={modalVisible} onDismiss={() => { setModalVisible(false); resetForm(); }} contentContainerStyle={styles.modal}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.modalTitle}>Add New Entry</Text>
                        <RadioButton.Group onValueChange={value => setFormData({ ...formData, type: value, category: '' })} value={formData.type}>
                            <View style={styles.radioGroup}><RadioButton.Item label="Income" value="INCOME" color={colors.success} /><RadioButton.Item label="Expense" value="EXPENSE" color={colors.error} /></View>
                        </RadioButton.Group>
                        <TouchableOpacity style={[styles.categorySelector, formErrors.category && { borderColor: colors.error }]} onPress={() => setShowCategoryPicker(true)}>
                            <Text style={[styles.categorySelectorText, !formData.category && styles.placeholderText]}>{formData.category || 'Select Category'}</Text>
                            <Icon name="chevron-down" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                        {formErrors.category && <Text style={styles.errorText}>{formErrors.category}</Text>}
                        <TextInput label="Amount (€)" value={formData.amount} onChangeText={text => setFormData({ ...formData, amount: text })} mode="outlined" keyboardType="decimal-pad" style={styles.input} error={!!formErrors.amount} theme={{ colors: { primary: colors.primary } }} />
                        {formErrors.amount && <Text style={styles.errorText}>{formErrors.amount}</Text>}
                        <TextInput label="Description (Optional)" value={formData.description} onChangeText={text => setFormData({ ...formData, description: text })} mode="outlined" multiline numberOfLines={2} style={styles.input} theme={{ colors: { primary: colors.primary } }} />
                        <TouchableOpacity style={styles.dateSelector} onPress={() => setShowDatePicker(true)}>
                            <Icon name="calendar" size={24} color={colors.primary} /><Text style={styles.dateSelectorText}>{formatDate(formData.entryDate)}</Text>
                        </TouchableOpacity>
                        <View style={styles.modalButtons}><Button mode="outlined" onPress={() => { setModalVisible(false); resetForm(); }} style={styles.modalButton}>Cancel</Button><Button mode="contained" onPress={handleSubmit} style={styles.modalButton}>Add Entry</Button></View>
                    </ScrollView>
                </Modal>
            </Portal>

            {showDatePicker && <DateTimePicker value={formData.entryDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={handleDateChange} maximumDate={new Date()} />}

            {/* Category Picker Modal */}
            <Portal>
                <Modal visible={showCategoryPicker} onDismiss={() => setShowCategoryPicker(false)} contentContainerStyle={[styles.modal, { maxHeight: '50%' }]}>
                    <Text style={styles.modalTitle}>Select Category</Text>
                    <ScrollView>
                        {(categories[formData.type.toLowerCase()] || []).map((category) => (
                            <TouchableOpacity key={category} style={styles.categoryOption} onPress={() => { setFormData({ ...formData, category }); setShowCategoryPicker(false); }}>
                                <Text style={styles.categoryOptionText}>{category}</Text>
                                {formData.category === category && <Icon name="check" size={24} color={colors.primary} />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Modal>
            </Portal>
        </SafeAreaView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { paddingBottom: 80 },
    summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md, gap: spacing.sm },
    summaryCard: { flex: 1, borderRadius: borderRadius.lg, elevation: 2 },
    incomeCard: { backgroundColor: `${colors.successLight}20` },
    expenseCard: { backgroundColor: `${colors.errorLight}20` },
    balanceCard: { backgroundColor: `${colors.primaryLight}20` },
    summaryLabel: { fontSize: fonts.sizes.sm, fontFamily: fonts.families.regular, color: colors.textSecondary, marginBottom: spacing.xs, textAlign: 'center' },
    summaryAmount: { fontSize: fonts.sizes.lg, fontFamily: fonts.families.bold, textAlign: 'center' },
    positiveBalance: { color: colors.success },
    negativeBalance: { color: colors.error },
    entriesSection: { padding: spacing.md },
    sectionTitle: { fontSize: fonts.sizes.lg, fontFamily: fonts.families.semiBold, color: colors.text, marginBottom: spacing.md },
    entryCard: { marginBottom: spacing.sm, borderRadius: borderRadius.lg, backgroundColor: colors.surface, ...shadows.sm },
    entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    entryInfo: { flex: 1, marginRight: spacing.md },
    entryCategory: { fontSize: fonts.sizes.md, fontFamily: fonts.families.semiBold, color: colors.text, marginBottom: spacing.xs / 2 },
    entryDescription: { fontSize: fonts.sizes.sm, fontFamily: fonts.families.regular, color: colors.textSecondary, marginBottom: spacing.xs },
    entryDate: { fontSize: fonts.sizes.xs, fontFamily: fonts.families.regular, color: colors.textTertiary },
    entryAmount: { fontSize: fonts.sizes.lg, fontFamily: fonts.families.bold },
    incomeAmount: { color: colors.success },
    expenseAmount: { color: colors.error },
    fab: { position: 'absolute', margin: spacing.md, right: 0, bottom: 0, backgroundColor: colors.primary },
    modal: { backgroundColor: colors.surface, padding: spacing.lg, margin: spacing.lg, borderRadius: borderRadius.lg, maxHeight: '85%' },
    modalTitle: { fontSize: fonts.sizes.xl, fontFamily: fonts.families.bold, color: colors.text, marginBottom: spacing.lg },
    radioGroup: { flexDirection: 'row', marginBottom: spacing.md, justifyContent: 'center' },
    input: { marginBottom: spacing.md, backgroundColor: colors.surface },
    errorText: { color: colors.error, fontSize: fonts.sizes.sm, marginTop: -spacing.sm, marginBottom: spacing.sm, marginLeft: spacing.xs },
    categorySelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.md },
    categorySelectorText: { fontSize: fonts.sizes.md, fontFamily: fonts.families.regular, color: colors.text },
    placeholderText: { color: colors.placeholder },
    dateSelector: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.lg },
    dateSelectorText: { fontSize: fonts.sizes.md, fontFamily: fonts.families.regular, color: colors.text, marginLeft: spacing.sm },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-evenly', gap: spacing.sm, paddingTop: spacing.sm },
    modalButton: { flex: 1 },
    categoryOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
    categoryOptionText: { fontSize: fonts.sizes.md, fontFamily: fonts.families.regular, color: colors.text },
});

export default React.memo(BudgetScreen);