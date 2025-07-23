import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Button, Checkbox } from 'react-native-paper';

import { PROFESSIONAL_PATHS } from '../../constants/config';
import { colors } from '../../constants/theme';
import checklistService from '../../services/checklistService';
import { useAuth } from '../../store/contexts/AuthContext';
import { styles } from '../../styles/screens/onboarding/PrioritySelectionScreenStyles';

const PrioritySelectionScreen = ({ route, navigation }) => {
    const { professionalPath } = route.params;
    const { completeOnboarding, user } = useAuth();
    const [selectedPriorities, setSelectedPriorities] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load any pre-selected items from registration
        loadPendingChecklistItems();
    }, []);

    const loadPendingChecklistItems = async () => {
        try {
            const pendingItems = await AsyncStorage.getItem('pendingChecklistItems');
            if (pendingItems) {
                setSelectedPriorities(JSON.parse(pendingItems));
                // Clear the pending items
                await AsyncStorage.removeItem('pendingChecklistItems');
            }
        } catch (error) {
            console.error('Error loading pending checklist items:', error);
        }
    };

    const priorities =
        professionalPath === PROFESSIONAL_PATHS.FREELANCER
            ? [
                { id: 'OBTAIN_NIE', title: 'Obtain your NIE' },
                { id: 'REGISTER_AUTONOMO', title: 'Register as \'Autónomo\'' },
                { id: 'UNDERSTAND_TAXES', title: 'Understand Tax Obligations' },
                { id: 'OPEN_BANK_ACCOUNT', title: 'Open Spanish Bank Account' },
            ]
            : [
                { id: 'OBTAIN_NIE', title: 'Obtain your NIE' },
                { id: 'FORM_SL_COMPANY', title: 'Form an S.L. Company' },
                { id: 'GET_COMPANY_NIF', title: 'Get Company NIF' },
                { id: 'RESEARCH_FUNDING', title: 'Research Funding Options' },
            ];

    const togglePriority = (priorityId) => {
        if (selectedPriorities.includes(priorityId)) {
            setSelectedPriorities(selectedPriorities.filter((id) => id !== priorityId));
        } else {
            setSelectedPriorities([...selectedPriorities, priorityId]);
        }
    };

    const handleComplete = async () => {
        if (selectedPriorities.length === 0) {
            Alert.alert('Select Priorities', 'Please select at least one priority to continue.');
            return;
        }

        setLoading(true);
        try {
            // First, initialize the checklist items in the backend
            await checklistService.initializeChecklist(selectedPriorities);

            // Then complete the onboarding
            await completeOnboarding(selectedPriorities);

            // Navigation will be handled by AuthContext
        } catch (error) {
            console.error('Error completing onboarding:', error);
            Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>What's on your mind right now?</Text>
                    <Text style={styles.subtitle}>
                        Select your priorities and we'll pin them to your dashboard.
                    </Text>
                </View>

                <View style={styles.prioritiesContainer}>
                    {priorities.map((priority) => (
                        <TouchableOpacity
                            key={priority.id}
                            style={[
                                styles.priorityCard,
                                selectedPriorities.includes(priority.id) &&
                                    styles.priorityCardSelected,
                            ]}
                            onPress={() => togglePriority(priority.id)}
                            activeOpacity={0.8}
                        >
                            <Checkbox.Android
                                status={
                                    selectedPriorities.includes(priority.id)
                                        ? 'checked'
                                        : 'unchecked'
                                }
                                color={colors.primary}
                            />
                            <Text
                                style={[
                                    styles.priorityText,
                                    selectedPriorities.includes(priority.id) &&
                                        styles.priorityTextSelected,
                                ]}
                            >
                                {priority.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.footer}>
                    <Button
                        mode="contained"
                        onPress={handleComplete}
                        loading={loading}
                        disabled={loading || selectedPriorities.length === 0}
                        style={styles.completeButton}
                        contentStyle={styles.completeButtonContent}
                        labelStyle={{ color: 'white' }}
                    >
                        Complete Setup
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PrioritySelectionScreen;
