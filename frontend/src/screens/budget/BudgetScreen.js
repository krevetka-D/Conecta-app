import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    SafeAreaView,
    Platform,
    StyleSheet,
    Modal as RNModal,
} from 'react-native';
import {
    Card,
    FAB,
    Portal,
    Modal,
    TextInput,
    RadioButton,
    Button,
    Provider,
} from 'react-native-paper';

import EmptyState from '../../components/common/EmptyState';
import Icon from '../../components/common/Icon.js';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import WebDateTimePicker from '../../components/common/WebDateTimePicker';
import { OptimizedInput } from '../../components/ui/OptimizedInput';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../constants/messages';
import { colors } from '../../constants/theme';
import { useSocketEvents } from '../../hooks/useSocketEvents';
import apiClient from '../../services/api/client';
import budgetService from '../../services/budgetService';
import socketService from '../../services/socketService';
import { useAuth } from '../../store/contexts/AuthContext';
import { budgetStyles as styles } from '../../styles/screens/budget/BudgetScreenStyles';
import { showErrorAlert, showSuccessAlert, showConfirmAlert } from '../../utils/alerts';
import { devLog, devError } from '../../utils/devLog';
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
    const [deletingEntries, setDeletingEntries] = useState(new Set());

    const [formData, setFormData] = useState({
        type: 'EXPENSE',
        category: '',
        amount: '',
        description: '',
        entryDate: (() => {
            const today = new Date();
            today.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
            return today;
        })(),
    });

    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        loadCategories(user?.professionalPath || 'FREELANCER');
    }, [user?.professionalPath]);

    // Move loadBudgetEntries up before it's used
    const loadBudgetEntries = useCallback(async (forceRefresh = false) => {
        try {
            if (!refreshing && !forceRefresh) {
                setLoading(true);
            }
            
            // Always clear cache before loading to ensure fresh data
            await apiClient.clearCache('/budget');
            await apiClient.clearCache('/budget/summary');
            
            const data = await budgetService.getBudgetEntries();
            setEntries(data || []);
            
            devLog('Budget', `Loaded ${data?.length || 0} entries`);
        } catch (error) {
            devError('Budget', 'Failed to load budget entries', error);
            if (!refreshing) {
                showErrorAlert('Error', ERROR_MESSAGES.BUDGET_LOAD_FAILED);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [refreshing]);

    // Socket event handlers
    const socketEventHandlers = {
        'budget_update': useCallback((data) => {
            devLog('Budget', 'Received real-time update:', data);
            
            // Clear API cache for budget endpoints
            apiClient.clearCache('/budget');
            apiClient.clearCache('/budget/summary');
            
            // Always reload to ensure consistency
            loadBudgetEntries(true);
        }, [loadBudgetEntries]),
    };
    
    // Use socket events hook
    useSocketEvents(socketEventHandlers, [loadBudgetEntries]);
    
    // Also listen directly to socketEventManager for budget updates
    useEffect(() => {
        import('../../utils/socketEventManager').then(({ default: socketEventManager }) => {
            const unsubscribe = socketEventManager.on('budget_update', (data) => {
                devLog('Budget', 'Received budget update from event manager:', data);
                loadBudgetEntries(true);
            });
            
            return () => {
                unsubscribe();
            };
        });
    }, [loadBudgetEntries]);
    
    useEffect(() => {
        loadBudgetEntries();
    }, [loadBudgetEntries]);

    const loadCategories = useCallback(async (professionalPath = 'FREELANCER') => {
        try {
            const response = await budgetService.getCategories(professionalPath);
            if (response && (response.income || response.expense)) {
                setCategories({
                    income: response.income || [],
                    expense: response.expense || [],
                });
            } else {
                throw new Error('Invalid categories response');
            }
        } catch (error) {
            devError('Budget', 'Failed to load categories', error);
            const defaultCategories =
                professionalPath === 'ENTREPRENEUR'
                    ? {
                        income: [
                            'Product Sales',
                            'Service Revenue',
                            'Investor Funding',
                            'Grants',
                            'Other Income',
                        ],
                        expense: [
                            'Salaries & Payroll',
                            'Office Rent',
                            'Legal & Accounting',
                            'Marketing & Sales',
                            'R&D',
                            'Operations',
                            'Other Expenses',
                        ],
                    }
                    : {
                        income: [
                            'Project-Based Income',
                            'Recurring Clients',
                            'Passive Income',
                            'Other Income',
                        ],
                        expense: [
                            'Cuota de Autónomo',
                            'Office/Coworking',
                            'Software & Tools',
                            'Professional Services',
                            'Marketing',
                            'Travel & Transport',
                            'Other Expenses',
                        ],
                    };
            setCategories(defaultCategories);
        }
    }, []);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadBudgetEntries(true);
        if (user?.professionalPath) {
            loadCategories(user.professionalPath);
        }
    }, [loadBudgetEntries, user?.professionalPath]);

    const validateForm = () => {
        const errors = {};
        if (!formData.category) errors.category = 'Please select a category';
        if (!formData.amount || parseFloat(formData.amount) <= 0)
            errors.amount = 'Please enter a valid amount';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        try {
            const entryData = { ...formData, amount: parseFloat(formData.amount) };
            const newEntry = await budgetService.createBudgetEntry(entryData);
            
            // Update local state immediately for better UX
            if (newEntry) {
                setEntries(prevEntries => [newEntry, ...prevEntries]);
            }
            
            showSuccessAlert('Success', SUCCESS_MESSAGES.ENTRY_ADDED);
            setModalVisible(false);
            resetForm();
            
            // Force reload to get fresh data
            setTimeout(() => loadBudgetEntries(true), 500);
        } catch (error) {
            devError('Budget', 'Failed to add budget entry', error);
            showErrorAlert('Error', ERROR_MESSAGES.BUDGET_ENTRY_FAILED);
        }
    };

    const handleDelete = (entryId) => {
        // Prevent duplicate deletion attempts
        if (deletingEntries.has(entryId)) {
            devLog('Budget', 'Already deleting entry', entryId);
            return;
        }

        // Check if entry still exists in local state
        const entryExists = entries.some(entry => entry._id === entryId);
        if (!entryExists) {
            devLog('Budget', 'Entry already removed from local state', entryId);
            return;
        }

        showConfirmAlert('Delete Entry', 'Are you sure?', async () => {
            try {
                // Mark entry as being deleted
                setDeletingEntries(prev => new Set(prev).add(entryId));
                
                // Optimistically update UI
                setEntries(prevEntries => prevEntries.filter(entry => entry._id !== entryId));
                
                const response = await budgetService.deleteBudgetEntry(entryId);
                
                // Check if it was already deleted
                if (response?.alreadyDeleted) {
                    devLog('Budget', 'Entry was already deleted', entryId);
                }
                
                showSuccessAlert('Success', SUCCESS_MESSAGES.ENTRY_DELETED);
                
                // Force reload to sync with server
                setTimeout(() => loadBudgetEntries(true), 500);
            } catch (error) {
                devError('Budget', 'Failed to delete entry', error);
                
                // Only show error and revert if it's not a 404
                if (error.response?.status !== 404) {
                    showErrorAlert('Error', ERROR_MESSAGES.BUDGET_DELETE_FAILED);
                    // Force reload to revert on error
                    loadBudgetEntries(true);
                } else {
                    // Entry was already deleted, just sync
                    devLog('Budget', 'Entry not found, syncing state');
                    loadBudgetEntries(true);
                }
            } finally {
                // Remove from deleting set
                setDeletingEntries(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(entryId);
                    return newSet;
                });
            }
        });
    };

    const resetForm = () => {
        // Ensure the initial date is today or earlier
        const today = new Date();
        today.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

        setFormData({
            type: 'EXPENSE',
            category: '',
            amount: '',
            description: '',
            entryDate: today,
        });
        setFormErrors({});
    };

    const handleDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (selectedDate) {
            // Ensure the selected date is not in the future
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            const selected = new Date(selectedDate);

            if (selected <= today) {
                setFormData({ ...formData, entryDate: selected });
            } else {
                // If future date selected, show error and keep current date
                showErrorAlert('Invalid Date', 'You cannot select a future date');
            }
        }
    };

    const calculateSummary = () => {
        const income = entries
            .filter((e) => e.type === 'INCOME')
            .reduce((sum, e) => sum + e.amount, 0);
        const expenses = entries
            .filter((e) => e.type === 'EXPENSE')
            .reduce((sum, e) => sum + e.amount, 0);
        return { income, expenses, balance: income - expenses };
    };

    const renderEntryCard = ({ item }) => (
        <View style={styles.entryCardContainer}>
            <View style={styles.entryCardContent}>
                <Card style={styles.entryCard}>
                    <Card.Content>
                        <View style={styles.entryHeader}>
                            <View style={styles.entryInfo}>
                                <Text style={styles.entryCategory}>{item.category}</Text>
                                {item.description && (
                                    <Text style={styles.entryDescription}>{item.description}</Text>
                                )}
                                <Text style={styles.entryDate}>{formatDate(item.entryDate)}</Text>
                            </View>
                            <Text
                                style={[
                                    styles.entryAmount,
                                    item.type === 'INCOME'
                                        ? styles.incomeAmount
                                        : styles.expenseAmount,
                                ]}
                            >
                                {item.type === 'INCOME' ? '+' : '-'}
                                {formatCurrency(item.amount)}
                            </Text>
                        </View>
                    </Card.Content>
                    <Card.Actions>
                        <Button 
                            onPress={() => handleDelete(item._id)} 
                            textColor={colors.error}
                            disabled={deletingEntries.has(item._id)}
                            loading={deletingEntries.has(item._id)}
                        >
                            {deletingEntries.has(item._id) ? 'Deleting...' : 'Delete'}
                        </Button>
                    </Card.Actions>
                </Card>
            </View>
        </View>
    );

    if (loading && !refreshing) {
        return <LoadingSpinner fullScreen text="Loading your budget..." />;
    }

    const { income, expenses, balance } = calculateSummary();

    // Main content without Provider wrapper
    const mainContent = (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryCardContainer}>
                        <View style={styles.summaryCardContent}>
                            <Card style={styles.summaryCard}>
                                <View style={styles.summaryCardInner}>
                                    <Text style={styles.summaryLabel}>Income</Text>
                                    <Text style={[styles.summaryAmount, styles.incomeAmountColor]}>
                                        {formatCurrency(income)}
                                    </Text>
                                </View>
                            </Card>
                        </View>
                    </View>

                    <View style={styles.summaryCardContainer}>
                        <View style={styles.summaryCardContent}>
                            <Card style={styles.summaryCard}>
                                <View style={styles.summaryCardInner}>
                                    <Text style={styles.summaryLabel}>Expenses</Text>
                                    <Text style={[styles.summaryAmount, styles.expenseAmountColor]}>
                                        {formatCurrency(expenses)}
                                    </Text>
                                </View>
                            </Card>
                        </View>
                    </View>

                    <View style={styles.summaryCardContainer}>
                        <View style={styles.summaryCardContent}>
                            <Card style={styles.summaryCard}>
                                <View style={styles.summaryCardInner}>
                                    <Text style={styles.summaryLabel}>Balance</Text>
                                    <Text
                                        style={[
                                            styles.summaryAmount,
                                            balance >= 0
                                                ? styles.positiveBalance
                                                : styles.negativeBalance,
                                        ]}
                                    >
                                        {formatCurrency(balance)}
                                    </Text>
                                </View>
                            </Card>
                        </View>
                    </View>
                </View>

                <View style={styles.entriesSection}>
                    <Text style={styles.sectionTitle}>Recent Transactions</Text>
                    {entries.length === 0 ? (
                        <EmptyState
                            icon="cash-remove"
                            title="No transactions yet"
                            message="Add your first entry to get started"
                            action={
                                <Button
                                    mode="contained"
                                    onPress={() => setModalVisible(true)}
                                    icon="plus"
                                >
                                    Add Entry
                                </Button>
                            }
                        />
                    ) : (
                        entries.map((entry) => (
                            <View key={entry._id}>{renderEntryCard({ item: entry })}</View>
                        ))
                    )}
                </View>
            </ScrollView>

            <FAB icon="plus" style={styles.fab} onPress={() => setModalVisible(true)} />
        </SafeAreaView>
    );

    // Return with Provider wrapper and all Portals
    return (
        <Provider>
            {mainContent}

            <Portal>
                <Modal
                    visible={modalVisible}
                    onDismiss={() => {
                        setModalVisible(false);
                        resetForm();
                    }}
                    contentContainerStyle={styles.modalContainer}
                >
                    <View style={styles.modalContent}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalTitle}>Add New Entry</Text>

                            <RadioButton.Group
                                onValueChange={(value) =>
                                    setFormData({ ...formData, type: value, category: '' })
                                }
                                value={formData.type}
                            >
                                <View style={styles.radioGroup}>
                                    <RadioButton.Item
                                        label="Income"
                                        value="INCOME"
                                        color={colors.success}
                                    />
                                    <RadioButton.Item
                                        label="Expense"
                                        value="EXPENSE"
                                        color={colors.error}
                                    />
                                </View>
                            </RadioButton.Group>

                            <TouchableOpacity
                                style={[
                                    styles.categorySelector,
                                    formErrors.category && styles.categorySelectorError,
                                ]}
                                onPress={() => setShowCategoryPicker(true)}
                            >
                                <Text
                                    style={[
                                        styles.categorySelectorText,
                                        !formData.category && styles.placeholderText,
                                    ]}
                                >
                                    {formData.category || 'Select Category'}
                                </Text>
                                <Icon name="chevron-down" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                            {formErrors.category && (
                                <Text style={styles.errorText}>{formErrors.category}</Text>
                            )}

                            <TextInput
                                label="Amount (€)"
                                value={formData.amount}
                                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                                mode="outlined"
                                keyboardType="decimal-pad"
                                style={styles.input}
                                error={!!formErrors.amount}
                                theme={{ colors: { primary: colors.primary } }}
                            />
                            {formErrors.amount && (
                                <Text style={styles.errorText}>{formErrors.amount}</Text>
                            )}

                            <OptimizedInput
                                label="Description (Optional)"
                                value={formData.description}
                                onChangeText={(text) =>
                                    setFormData((prev) => ({ ...prev, description: text }))
                                }
                                multiline
                                numberOfLines={3}
                                maxLength={200}
                                placeholder="Enter description..."
                            />

                            <TouchableOpacity
                                style={styles.dateSelector}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Icon name="calendar" size={24} color={colors.primary} />
                                <Text style={styles.dateSelectorText}>
                                    {formatDate(formData.entryDate)}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.modalButtons}>
                                <Button
                                    mode="outlined"
                                    onPress={() => {
                                        setModalVisible(false);
                                        resetForm();
                                    }}
                                    style={styles.modalButton}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={handleSubmit}
                                    style={styles.modalButton}
                                >
                                    Add Entry
                                </Button>
                            </View>
                        </ScrollView>
                    </View>
                </Modal>
            </Portal>

            {/* Use React Native's Modal for Category Picker - This will appear on top */}
            <RNModal
                visible={showCategoryPicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowCategoryPicker(false)}
            >
                <TouchableOpacity
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    activeOpacity={1}
                    onPress={() => setShowCategoryPicker(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{
                            backgroundColor: colors.surface,
                            borderRadius: 16,
                            padding: 20,
                            width: '90%',
                            maxHeight: '70%',
                            elevation: 1000,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                        }}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Text style={styles.modalTitle}>Select Category</Text>
                        <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                            {(categories[formData.type.toLowerCase()] || []).map((category) => (
                                <TouchableOpacity
                                    key={category}
                                    style={styles.categoryOption}
                                    onPress={() => {
                                        setFormData({ ...formData, category });
                                        setShowCategoryPicker(false);
                                    }}
                                >
                                    <Text style={styles.categoryOptionText}>{category}</Text>
                                    {formData.category === category && (
                                        <Icon name="check" size={24} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            style={{
                                marginTop: 16,
                                paddingVertical: 12,
                                alignItems: 'center',
                                borderTopWidth: 1,
                                borderTopColor: colors.border,
                            }}
                            onPress={() => setShowCategoryPicker(false)}
                        >
                            <Text
                                style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}
                            >
                                Close
                            </Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </RNModal>

            {/* Date Picker Modal */}
            {showDatePicker && Platform.OS === 'ios' && (
                <RNModal
                    visible={showDatePicker}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowDatePicker(false)}
                >
                    <TouchableOpacity
                        style={styles.datePickerOverlay}
                        activeOpacity={1}
                        onPress={() => setShowDatePicker(false)}
                    >
                        <TouchableOpacity
                            activeOpacity={1}
                            style={styles.datePickerContent}
                            onPress={(e) => e.stopPropagation()}
                        >
                            <View style={styles.datePickerHeader}>
                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                    <Text style={styles.datePickerCancel}>Cancel</Text>
                                </TouchableOpacity>
                                <Text style={styles.datePickerTitle}>Select Date</Text>
                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                    <Text style={styles.datePickerDone}>Done</Text>
                                </TouchableOpacity>
                            </View>
                            <WebDateTimePicker
                                value={formData.entryDate}
                                mode="date"
                                display="spinner"
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) {
                                        // Ensure the selected date is not in the future
                                        const today = new Date();
                                        today.setHours(23, 59, 59, 999);
                                        const selected = new Date(selectedDate);

                                        if (selected <= today) {
                                            setFormData({ ...formData, entryDate: selected });
                                        } else {
                                            // If future date selected, set to today
                                            showErrorAlert(
                                                'Invalid Date',
                                                'You cannot select a future date',
                                            );
                                            setFormData({ ...formData, entryDate: new Date() });
                                        }
                                    }
                                }}
                                maximumDate={new Date()}
                                minimumDate={new Date(2020, 0, 1)} // Set a reasonable minimum date
                                style={styles.datePicker}
                                themeVariant="light"
                            />
                        </TouchableOpacity>
                    </TouchableOpacity>
                </RNModal>
            )}

            {/* Android Date Picker */}
            {showDatePicker && Platform.OS === 'android' && (
                <WebDateTimePicker
                    value={formData.entryDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                />
            )}
        </Provider>
    );
};

export default React.memo(BudgetScreen);
