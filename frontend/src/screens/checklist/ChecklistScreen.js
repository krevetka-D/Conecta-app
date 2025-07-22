// frontend/src/screens/checklist/ChecklistScreen.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
    SafeAreaView,
} from 'react-native';
import { Card, Checkbox, ProgressBar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from '../../components/common/Icon.js';
import { useAuth } from '../../store/contexts/AuthContext';
import { colors } from '../../constants/theme';
import checklistService from '../../services/checklistService';
import { showErrorAlert, showSuccessAlert } from '../../utils/alerts';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../constants/messages';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { checklistStyles as styles } from '../../styles/screens/checklist/ChecklistScreenStyles';

const CHECKLIST_ITEMS = {
    FREELANCER: [
        {
            key: 'OBTAIN_NIE',
            title: 'Obtain your NIE',
            description: 'Get your foreigner identification number',
            icon: 'card-account-details',
            infoLink: 'nie-guide'
        },
        {
            key: 'REGISTER_AUTONOMO',
            title: 'Register as Autónomo',
            description: 'Complete your self-employment registration',
            icon: 'briefcase-account',
            infoLink: 'autonomo-guide'
        },
        {
            key: 'UNDERSTAND_TAXES',
            title: 'Understand Tax Obligations',
            description: 'Learn about IVA and IRPF requirements',
            icon: 'calculator',
            infoLink: 'taxes-guide'
        },
        {
            key: 'OPEN_BANK_ACCOUNT',
            title: 'Open Spanish Bank Account',
            description: 'Set up your business banking',
            icon: 'bank',
            infoLink: 'banking-guide'
        },
    ],
    ENTREPRENEUR: [
        {
            key: 'OBTAIN_NIE',
            title: 'Obtain your NIE',
            description: 'Get your foreigner identification number',
            icon: 'card-account-details',
            infoLink: 'nie-guide'
        },
        {
            key: 'FORM_SL_COMPANY',
            title: 'Form an S.L. Company',
            description: 'Establish your limited liability company',
            icon: 'domain',
            infoLink: 'company-formation-guide'
        },
        {
            key: 'GET_COMPANY_NIF',
            title: 'Get Company NIF',
            description: 'Obtain your company tax ID',
            icon: 'identifier',
            infoLink: 'company-nif-guide'
        },
        {
            key: 'RESEARCH_FUNDING',
            title: 'Research Funding Options',
            description: 'Explore grants and investment opportunities',
            icon: 'cash-multiple',
            infoLink: 'funding-guide'
        },
    ],
};

const ChecklistItem = React.memo(({ item, checklistItem, isUpdating, onToggle, onInfoPress }) => {
    const isCompleted = checklistItem?.isCompleted || false;

    return (
        <Card
            style={[
                styles.checklistCard,
                isCompleted && styles.completedCard,
            ]}
        >
            <TouchableOpacity
                onPress={() => onToggle(item.key, isCompleted)}
                disabled={isUpdating}
                style={styles.cardTouchable}
                activeOpacity={0.7}
            >
                <View style={styles.cardContent}>
                    <View style={styles.checkboxContainer}>
                        {isUpdating ? (
                            <View style={styles.loadingCheckbox}>
                                <LoadingSpinner size="small" />
                            </View>
                        ) : (
                            <Checkbox
                                status={isCompleted ? 'checked' : 'unchecked'}
                                color={colors.primary}
                                disabled={isUpdating}
                            />
                        )}
                    </View>

                    <View style={styles.cardTextContainer}>
                        <View style={styles.titleRow}>
                            <Icon
                                name={item.icon}
                                size={20}
                                color={isCompleted ? colors.textSecondary : colors.primary}
                                style={styles.itemIcon}
                            />
                            <Text style={[
                                styles.cardTitle,
                                isCompleted && styles.completedText
                            ]}>
                                {item.title}
                            </Text>
                        </View>
                        <Text style={[
                            styles.cardDescription,
                            isCompleted && styles.completedDescription
                        ]}>
                            {item.description}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => onInfoPress(item.infoLink)}
                        style={styles.infoButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Icon
                            name="information-outline"
                            size={24}
                            color={colors.primary}
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Card>
    );
});

const ChecklistScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [checklistData, setChecklistData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [updating, setUpdating] = useState({});
    const [isInitializing, setIsInitializing] = useState(false);

    const loadChecklist = useCallback(async () => {
        try {
            const data = await checklistService.getChecklist();
            
            // If no checklist data and user has pendingChecklistItems, try to initialize
            if ((!data || data.length === 0) && user && !isInitializing) {
                const pendingItems = await AsyncStorage.getItem('pendingChecklistItems');
                if (pendingItems) {
                    const items = JSON.parse(pendingItems);
                    if (items.length > 0) {
                        try {
                            setIsInitializing(true);
                            console.log('Initializing checklist with pending items:', items);
                            await checklistService.initializeChecklist(items);
                            await AsyncStorage.removeItem('pendingChecklistItems');
                            // Reload checklist after initialization
                            const newData = await checklistService.getChecklist();
                            setChecklistData(newData || []);
                            setIsInitializing(false);
                            return;
                        } catch (error) {
                            console.error('Failed to initialize checklist from pending items:', error);
                            setIsInitializing(false);
                        }
                    }
                }
            }
            
            setChecklistData(data || []);
        } catch (error) {
            console.error('Failed to load checklist:', error);
            showErrorAlert('Error', ERROR_MESSAGES.CHECKLIST_LOAD_FAILED);
        } finally {
            setLoading(false);
        }
    }, [user, isInitializing]);

    useEffect(() => {
        loadChecklist();
    }, [loadChecklist]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadChecklist();
        setRefreshing(false);
    }, [loadChecklist]);

    const handleToggle = useCallback(async (itemKey, currentStatus) => {
        setUpdating(prev => ({ ...prev, [itemKey]: true }));

        try {
            await checklistService.updateChecklistItem(itemKey, !currentStatus);
            await loadChecklist();

            if (!currentStatus) {
                showSuccessAlert('Great job!', SUCCESS_MESSAGES.TASK_COMPLETED);
            }
        } catch (error) {
            console.error('Failed to update checklist item:', error);
            showErrorAlert('Error', ERROR_MESSAGES.CHECKLIST_UPDATE_FAILED);
        } finally {
            setUpdating(prev => ({ ...prev, [itemKey]: false }));
        }
    }, [loadChecklist]);

    const handleInfoPress = useCallback((infoLink) => {
        Alert.alert(
            'Guide Coming Soon',
            'Detailed guides are being prepared. Check back soon!',
            [
                { text: 'OK' }
            ]
        );
    }, []);

    // Use useMemo for calculations that depend on state/props
    const { items, completedCount, progress } = useMemo(() => {
        // Get all available items for the professional path
        const allItems = user?.professionalPath === 'FREELANCER'
            ? CHECKLIST_ITEMS.FREELANCER
            : CHECKLIST_ITEMS.ENTREPRENEUR;

        // Filter to show only the items that were selected during registration
        // The checklistData from backend should contain only the selected items
        const selectedItemKeys = checklistData.map(item => item.itemKey);
        const items = allItems.filter(item => selectedItemKeys.includes(item.key));

        const completedCount = checklistData.filter(item => item.isCompleted).length;
        const progress = items.length > 0 ? completedCount / items.length : 0;

        return { items, completedCount, progress };
    }, [user?.professionalPath, checklistData]);

    const motivationalMessage = useMemo(() => {
        if (progress === 0) return "Let's get started! 🚀";
        if (progress < 0.5) return "Great progress! Keep going! 💪";
        if (progress < 1) return "Almost there! You're doing amazing! 🌟";
        return "All done! You're ready to rock! 🎉";
    }, [progress]);

    if (loading || isInitializing) {
        return <LoadingSpinner fullScreen text="Loading your checklist..." />;
    }

    // If no items selected during registration
    if (items.length === 0) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <View style={styles.emptyContainer}>
                        <Icon name="clipboard-check-outline" size={64} color={colors.textSecondary} />
                        <Text style={styles.emptyTitle}>No checklist items</Text>
                        <Text style={styles.emptyText}>
                            You haven't selected any checklist items during registration.
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyStateButton}
                            onPress={() => navigation.navigate('Profile')}
                        >
                            <Text style={styles.emptyStateButtonText}>Go to Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
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
                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressTitle}>Your Progress</Text>
                        <Text style={styles.progressPercentage}>
                            {Math.round(progress * 100)}%
                        </Text>
                    </View>
                    <Text style={styles.progressText}>
                        {completedCount} of {items.length} steps completed
                    </Text>
                    <ProgressBar
                        progress={progress}
                        color={colors.primary}
                        style={styles.progressBar}
                    />
                    <Text style={styles.motivationalText}>
                        {motivationalMessage}
                    </Text>
                </View>

                <View style={styles.checklistSection}>
                    {items.map((item, index) => {
                        const checklistItem = checklistData.find(d => d.itemKey === item.key);
                        const isUpdating = updating[item.key] || false;

                        return (
                            <View key={item.key} style={index === 0 ? styles.firstCard : index === items.length - 1 ? styles.lastCard : null}>
                                <ChecklistItem
                                    item={item}
                                    checklistItem={checklistItem}
                                    isUpdating={isUpdating}
                                    onToggle={handleToggle}
                                    onInfoPress={handleInfoPress}
                                />
                            </View>
                        );
                    })}
                </View>

                <View style={styles.tipsSection}>
                    <Card style={styles.tipCard}>
                        <Card.Content>
                            <View style={styles.tipHeader}>
                                <Icon name="lightbulb-outline" size={24} color={colors.warning} />
                                <Text style={styles.tipTitle}>Pro Tip</Text>
                            </View>
                            <Text style={styles.tipText}>
                                {user?.professionalPath === 'FREELANCER'
                                    ? "Start with obtaining your NIE - it's required for all other steps! The process usually takes 2-4 weeks, so plan ahead."
                                    : "Consider consulting with a gestor for company formation - they can handle most of the paperwork and save you time."}
                            </Text>
                        </Card.Content>
                    </Card>

                    <Card style={styles.resourceCard}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Resources')}
                            style={styles.resourceTouchable}
                        >
                            <Card.Content style={styles.resourceContent}>
                                <Icon name="book-open-variant" size={24} color={colors.primary} />
                                <View style={styles.resourceTextContainer}>
                                    <Text style={styles.resourceTitle}>Need more help?</Text>
                                    <Text style={styles.resourceDescription}>
                                        Explore our guides and service directory
                                    </Text>
                                </View>
                                <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                            </Card.Content>
                        </TouchableOpacity>
                    </Card>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default React.memo(ChecklistScreen);