// frontend/src/screens/onboarding/ChecklistSelectionScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { Button, Checkbox, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../store/contexts/AuthContext';
import { colors } from '../../constants/theme';
import { styles } from '../../styles/screens/onboarding/ChecklistSelectionScreenStyles';

const AVAILABLE_CHECKLIST_ITEMS = {
    FREELANCER: [
        {
            key: 'OBTAIN_NIE',
            title: 'Obtain your NIE',
            description: 'Get your foreigner identification number',
            icon: 'card-account-details',
            priority: 'high',
            required: true
        },
        {
            key: 'REGISTER_AUTONOMO',
            title: 'Register as Autónomo',
            description: 'Complete your self-employment registration',
            icon: 'briefcase-account',
            priority: 'high',
            required: true
        },
        {
            key: 'UNDERSTAND_TAXES',
            title: 'Understand Tax Obligations',
            description: 'Learn about IVA and IRPF requirements',
            icon: 'calculator',
            priority: 'high',
            required: false
        },
        {
            key: 'OPEN_BANK_ACCOUNT',
            title: 'Open Spanish Bank Account',
            description: 'Set up your business banking',
            icon: 'bank',
            priority: 'medium',
            required: false
        },
        {
            key: 'FIND_COWORKING',
            title: 'Find Coworking Space',
            description: 'Locate a suitable workspace',
            icon: 'office-building',
            priority: 'low',
            required: false
        },
        {
            key: 'GET_HEALTH_INSURANCE',
            title: 'Get Health Insurance',
            description: 'Secure healthcare coverage',
            icon: 'medical-bag',
            priority: 'medium',
            required: false
        },
        {
            key: 'SETUP_ACCOUNTING',
            title: 'Setup Accounting System',
            description: 'Organize your financial records',
            icon: 'chart-line',
            priority: 'medium',
            required: false
        }
    ],
    ENTREPRENEUR: [
        {
            key: 'OBTAIN_NIE',
            title: 'Obtain your NIE',
            description: 'Get your foreigner identification number',
            icon: 'card-account-details',
            priority: 'high',
            required: true
        },
        {
            key: 'FORM_SL_COMPANY',
            title: 'Form an S.L. Company',
            description: 'Establish your limited liability company',
            icon: 'domain',
            priority: 'high',
            required: true
        },
        {
            key: 'GET_COMPANY_NIF',
            title: 'Get Company NIF',
            description: 'Obtain your company tax ID',
            icon: 'identifier',
            priority: 'high',
            required: false
        },
        {
            key: 'RESEARCH_FUNDING',
            title: 'Research Funding Options',
            description: 'Explore grants and investment opportunities',
            icon: 'cash-multiple',
            priority: 'medium',
            required: false
        },
        {
            key: 'HIRE_LEGAL_COUNSEL',
            title: 'Hire Legal Counsel',
            description: 'Get professional legal assistance',
            icon: 'gavel',
            priority: 'medium',
            required: false
        },
        {
            key: 'SETUP_OFFICE',
            title: 'Setup Office Space',
            description: 'Establish your business headquarters',
            icon: 'office-building-outline',
            priority: 'low',
            required: false
        },
        {
            key: 'DEVELOP_BUSINESS_PLAN',
            title: 'Develop Business Plan',
            description: 'Create comprehensive business strategy',
            icon: 'file-document-edit',
            priority: 'high',
            required: false
        }
    ]
};

const ChecklistSelectionScreen = ({ route, navigation }) => {
    const { professionalPath } = route.params;
    const { completeOnboarding } = useAuth();
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const availableItems = AVAILABLE_CHECKLIST_ITEMS[professionalPath] || [];

    useEffect(() => {
        // Auto-select required items
        const requiredItems = availableItems
            .filter(item => item.required)
            .map(item => item.key);
        setSelectedItems(requiredItems);
    }, [professionalPath]);

    const toggleItem = (itemKey, isRequired) => {
        if (isRequired) return; // Can't deselect required items

        if (selectedItems.includes(itemKey)) {
            setSelectedItems(selectedItems.filter(key => key !== itemKey));
        } else {
            setSelectedItems([...selectedItems, itemKey]);
        }
    };

    const handleComplete = async () => {
        if (selectedItems.length === 0) {
            Alert.alert('Selection Required', 'Please select at least one checklist item to continue.');
            return;
        }

        setLoading(true);
        try {
            await completeOnboarding(selectedItems);
        } catch (error) {
            console.error('Error completing onboarding:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return colors.error;
            case 'medium': return colors.warning;
            case 'low': return colors.success;
            default: return colors.textSecondary;
        }
    };

    const renderChecklistItem = (item) => {
        const isSelected = selectedItems.includes(item.key);
        const isRequired = item.required;

        return (
            <TouchableOpacity
                key={item.key}
                onPress={() => toggleItem(item.key, isRequired)}
                disabled={isRequired}
                activeOpacity={0.7}
            >
                <Card style={[
                    styles.itemCard,
                    isSelected && styles.itemCardSelected,
                    isRequired && styles.itemCardRequired
                ]}>
                    <Card.Content>
                        <View style={styles.itemContent}>
                            <View style={styles.leftContent}>
                                <Checkbox.Android
                                    status={isSelected ? 'checked' : 'unchecked'}
                                    color={colors.primary}
                                    disabled={isRequired}
                                />
                                <View style={[
                                    styles.iconContainer,
                                    { backgroundColor: colors.primaryLight + '20' }
                                ]}>
                                    <Icon 
                                        name={item.icon} 
                                        size={24} 
                                        color={colors.primary} 
                                    />
                                </View>
                            </View>
                            
                            <View style={styles.textContent}>
                                <View style={styles.titleRow}>
                                    <Text style={styles.itemTitle}>{item.title}</Text>
                                    <View style={styles.badges}>
                                        {isRequired && (
                                            <View style={styles.requiredBadge}>
                                                <Text style={styles.requiredText}>Required</Text>
                                            </View>
                                        )}
                                        <View style={[
                                            styles.priorityBadge,
                                            { backgroundColor: getPriorityColor(item.priority) + '20' }
                                        ]}>
                                            <Text style={[
                                                styles.priorityText,
                                                { color: getPriorityColor(item.priority) }
                                            ]}>
                                                {item.priority.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <Text style={styles.itemDescription}>{item.description}</Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>
            </TouchableOpacity>
        );
    };

    const groupedItems = {
        required: availableItems.filter(item => item.required),
        optional: availableItems.filter(item => !item.required)
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Customize Your Checklist</Text>
                    <Text style={styles.subtitle}>
                        Select the items that are most relevant to your journey in Alicante.
                        Required items are already selected for you.
                    </Text>
                </View>

                {/* Required Items */}
                {groupedItems.required.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Required Items</Text>
                        <Text style={styles.sectionSubtitle}>
                            These items are essential for your professional path
                        </Text>
                        {groupedItems.required.map(renderChecklistItem)}
                    </View>
                )}

                {/* Optional Items */}
                {groupedItems.optional.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Optional Items</Text>
                        <Text style={styles.sectionSubtitle}>
                            Choose additional items based on your priorities
                        </Text>
                        {groupedItems.optional.map(renderChecklistItem)}
                    </View>
                )}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        You've selected {selectedItems.length} items. You can always modify your checklist later in the app.
                    </Text>
                    
                    <Button
                        mode="contained"
                        onPress={handleComplete}
                        loading={loading}
                        disabled={loading || selectedItems.length === 0}
                        style={styles.completeButton}
                        contentStyle={styles.completeButtonContent}
                    >
                        Complete Setup
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ChecklistSelectionScreen;

// Update OnboardingNavigator.js to include the new screen
// frontend/src/navigation/OnboardingNavigator.js
import ChecklistSelectionScreen from '../screens/onboarding/ChecklistSelectionScreen';

// Add this to the navigator
<Stack.Screen
    name="ChecklistSelection"
    component={ChecklistSelectionScreen}
    options={{
        gestureEnabled: true,
    }}
/>

// Update PrioritySelectionScreen.js to navigate to ChecklistSelection
const handleComplete = async () => {
    navigation.navigate('ChecklistSelection', { professionalPath });
};