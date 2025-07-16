import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Platform,
} from 'react-native';
import { FAB, Card, Portal, Modal, TextInput, Button, RadioButton, Provider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../store/AuthContext';
import { colors } from '../../constants/theme';
import { BUDGET_CATEGORIES, PROFESSIONAL_PATHS } from '../../constants/config';
import budgetService from '../../services/budgetService';
import { format } from 'date-fns';

const BudgetScreen = () => {
    const { user } = useAuth();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Form states
    const [entryType, setEntryType] = useState('INCOME');
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [entryDate, setEntryDate] = useState(new Date());

    useEffect(() => {
        loadBudgetEntries();
    }, []);

    const loadBudgetEntries = async () => {
        setLoading(true);
        try {
            const data = await budgetService.getBudgetEntries();
            setEntries(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load budget entries');
        } finally {
            setLoading(false);
        }
    };

    const getCategories = () => {
        const isFreelancer = user?.professionalPath === PROFESSIONAL_PATHS.FREELANCER;
        if (entryType === 'INCOME') {
            return isFreelancer ? BUDGET_CATEGORIES.FREELANCER_INCOME : BUDGET_CATEGORIES.ENTREPRENEUR_INCOME;
        } else {
            return isFreelancer ? BUDGET_CATEGORIES.FREELANCER_EXPENSE : BUDGET_CATEGORIES.ENTREPRENEUR_EXPENSE;
        }
    };

    const handleAddEntry = async () => {
        if (!category || !amount) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            const entry = {
                type: entryType,
                category,
                amount: parseFloat(amount),
                description,
                entryDate: entryDate.toISOString(),
            };

            await budgetService.createBudgetEntry(entry);
            await loadBudgetEntries();
            resetForm();
            setModalVisible(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to add entry');
        }
    };

    const resetForm = () => {
        setEntryType('INCOME');
        setCategory('');
        setAmount('');
        setDescription('');
        setEntryDate(new Date());
    };

    const calculateTotals = () => {
        const income = entries
            .filter(e => e.type === 'INCOME')
            .reduce((sum, e) => sum + e.amount, 0);
        const expenses = entries
            .filter(e => e.type === 'EXPENSE')
            .reduce((sum, e) => sum + e.amount, 0);
        return { income, expenses, balance: income - expenses };
    };

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || entryDate;
        setShowDatePicker(Platform.OS === 'ios');
        setEntryDate(currentDate);
    };

    const totals = calculateTotals();

    return (
        <Provider>
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Summary Cards */}
                    <View style={styles.summaryContainer}>
                        <Card style={[styles.summaryCard, styles.incomeCard]}>
                            <Card.Content>
                                <Text style={styles.summaryLabel}>Income</Text>
                                <Text style={styles.summaryAmount}>€{totals.income.toFixed(2)}</Text>
                            </Card.Content>
                        </Card>

                        <Card style={[styles.summaryCard, styles.expenseCard]}>
                            <Card.Content>
                                <Text style={styles.summaryLabel}>Expenses</Text>
                                <Text style={styles.summaryAmount}>€{totals.expenses.toFixed(2)}</Text>
                            </Card.Content>
                        </Card>

                        <Card style={[styles.summaryCard, styles.balanceCard]}>
                            <Card.Content>
                                <Text style={styles.summaryLabel}>Balance</Text>
                                <Text style={[
                                    styles.summaryAmount,
                                    totals.balance >= 0 ? styles.positiveBalance : styles.negativeBalance
                                ]}>
                                    €{totals.balance.toFixed(2)}
                                </Text>
                            </Card.Content>
                        </Card>
                    </View>

                    {/* Entries List */}
                    <View style={styles.entriesSection}>
                        <Text style={styles.sectionTitle}>Recent Transactions</Text>
                        {entries.length === 0 ? (
                            <Text style={styles.emptyText}>No entries yet. Add your first transaction!</Text>
                        ) : (
                            entries.map((entry) => (
                                <Card key={entry._id} style={styles.entryCard}>
                                    <Card.Content>
                                        <View style={styles.entryHeader}>
                                            <View style={styles.entryInfo}>
                                                <Text style={styles.entryCategory}>{entry.category}</Text>
                                                {entry.description && (
                                                    <Text style={styles.entryDescription}>{entry.description}</Text>
                                                )}
                                                <Text style={styles.entryDate}>
                                                    {format(new Date(entry.entryDate), 'MMM d, yyyy')}
                                                </Text>
                                            </View>
                                            <Text style={[
                                                styles.entryAmount,
                                                entry.type === 'INCOME' ? styles.incomeAmount : styles.expenseAmount
                                            ]}>
                                                {entry.type === 'INCOME' ? '+' : '-'}€{entry.amount.toFixed(2)}
                                            </Text>
                                        </View>
                                    </Card.Content>
                                </Card>
                            ))
                        )}
                    </View>
                </ScrollView>

                {/* FAB */}
                <FAB
                    icon="plus"
                    style={styles.fab}
                    onPress={() => setModalVisible(true)}
                />

                {/* Add Entry Modal */}
                <Portal>
                    <Modal
                        visible={modalVisible}
                        onDismiss={() => {
                            setModalVisible(false);
                            resetForm();
                        }}
                        contentContainerStyle={styles.modal}
                    >
                        <ScrollView>
                            <Text style={styles.modalTitle}>Add Transaction</Text>

                            <RadioButton.Group onValueChange={setEntryType} value={entryType}>
                                <View style={styles.radioGroup}>
                                    <RadioButton.Item label="Income" value="INCOME" />
                                    <RadioButton.Item label="Expense" value="EXPENSE" />
                                </View>
                            </RadioButton.Group>

                            <TextInput
                                label="Amount"
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="decimal-pad"
                                mode="outlined"
                                style={styles.input}
                                left={<TextInput.Affix text="€" />}
                            />

                            <TouchableOpacity
                                style={styles.categorySelector}
                                onPress={() => {
                                    const categories = getCategories();
                                    Alert.alert(
                                        'Select Category',
                                        '',
                                        [
                                            ...categories.map(cat => ({
                                                text: cat,
                                                onPress: () => setCategory(cat),
                                            })),
                                            { text: 'Cancel', style: 'cancel' }
                                        ]
                                    );
                                }}
                            >
                                <Text style={[
                                    styles.categorySelectorText,
                                    !category && styles.placeholderText
                                ]}>
                                    {category || 'Select Category *'}
                                </Text>
                                <Icon name="chevron-down" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>

                            <TextInput
                                label="Description (optional)"
                                value={description}
                                onChangeText={setDescription}
                                mode="outlined"
                                style={styles.input}
                                multiline
                                numberOfLines={3}
                            />

                            <TouchableOpacity
                                style={styles.dateSelector}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Icon name="calendar" size={24} color={colors.primary} />
                                <Text style={styles.dateSelectorText}>
                                    {format(entryDate, 'MMMM d, yyyy')}
                                </Text>
                            </TouchableOpacity>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={entryDate}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleDateChange}
                                    maximumDate={new Date()}
                                />
                            )}

                            <View style={styles.modalButtons}>
                                <Button
                                    mode="outlined"
                                    onPress={() => {
                                        resetForm();
                                        setModalVisible(false);
                                    }}
                                    style={styles.modalButton}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={handleAddEntry}
                                    style={styles.modalButton}
                                    disabled={!category || !amount}
                                >
                                    Add Entry
                                </Button>
                            </View>
                        </ScrollView>
                    </Modal>
                </Portal>
            </View>
        </Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingBottom: 80,
    },
    summaryContainer: {
        padding: 20,
    },
    summaryCard: {
        marginBottom: 12,
        borderRadius: 12,
    },
    incomeCard: {
        backgroundColor: '#E0F2FE',
    },
    expenseCard: {
        backgroundColor: '#FEE2E2',
    },
    balanceCard: {
        backgroundColor: 'white',
    },
    summaryLabel: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: colors.textSecondary,
        marginBottom: 4,
    },
    summaryAmount: {
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        color: colors.text,
    },
    positiveBalance: {
        color: colors.success,
    },
    negativeBalance: {
        color: colors.error,
    },
    entriesSection: {
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold',
        color: colors.text,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 40,
    },
    entryCard: {
        marginBottom: 12,
        borderRadius: 12,
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
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: colors.text,
        marginBottom: 2,
    },
    entryDescription: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: colors.textSecondary,
        marginBottom: 2,
    },
    entryDate: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: colors.textSecondary,
    },
    entryAmount: {
        fontSize: 18,
        fontFamily: 'Poppins-Bold',
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
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        color: colors.text,
        marginBottom: 20,
    },
    radioGroup: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'white',
    },
    categorySelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 4,
        padding: 16,
        marginBottom: 16,
        backgroundColor: 'white',
    },
    categorySelectorText: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: colors.text,
    },
    placeholderText: {
        color: colors.textSecondary,
    },
    dateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 4,
        marginBottom: 20,
        backgroundColor: 'white',
    },
    dateSelectorText: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: colors.text,
        marginLeft: 12,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    modalButton: {
        flex: 1,
        marginHorizontal: 4,
    },
});

export default BudgetScreen;