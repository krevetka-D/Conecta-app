
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Alert,
} from 'react-native';
import { Button, Checkbox } from 'react-native-paper';
import { useAuth } from '../../store/contexts/AuthContext';
import { colors } from '../../constants/theme';
import { PROFESSIONAL_PATHS } from '../../constants/config';
import { styles } from '../../styles/screens/onboarding/PrioritySelectionScreenStyles';

const PrioritySelectionScreen = ({ route }) => {
    const { professionalPath } = route.params;
    const { completeOnboarding } = useAuth(); // Use the correct function from context
    const [selectedPriorities, setSelectedPriorities] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- DEBUG LOG ---
    // Log when the component mounts and what data it receives.
    useEffect(() => {
        console.log('[PrioritySelectionScreen] Component Mounted.');
        console.log('[PrioritySelectionScreen] Received professionalPath:', professionalPath);
        // Check if the function from the context is available
        if (typeof completeOnboarding === 'function') {
            console.log('[PrioritySelectionScreen] `completeOnboarding` function is available.');
        } else {
            console.error('[PrioritySelectionScreen] `completeOnboarding` function is MISSING from AuthContext!');
        }
    }, []);

    // --- DEBUG LOG ---
    // Log the state whenever it changes.
    useEffect(() => {
        console.log('[PrioritySelectionScreen] selectedPriorities state updated:', selectedPriorities);
    }, [selectedPriorities]);


    const priorities = professionalPath === PROFESSIONAL_PATHS.FREELANCER
        ? [
            { id: 'autonomo_checklist', title: "Register as 'Autónomo'" },
            { id: 'tax_guides', title: 'Understand my tax obligations' },
            { id: 'coworking_finder', title: 'Find a coworking space' },
        ]
        : [
            { id: 'company_formation', title: 'Form a company (S.L.)' },
            { id: 'funding_guide', title: 'Find investors or grants' },
            { id: 'legal_help', title: 'Get legal assistance' },
        ];

    const togglePriority = (priorityId) => {
        // --- DEBUG LOG ---
        console.log('[PrioritySelectionScreen] togglePriority called with ID:', priorityId);
        if (selectedPriorities.includes(priorityId)) {
            setSelectedPriorities(selectedPriorities.filter(id => id !== priorityId));
        } else {
            setSelectedPriorities([...selectedPriorities, priorityId]);
        }
    };

    const handleComplete = async () => {
        // --- DEBUG LOG ---
        console.log('[PrioritySelectionScreen] handleComplete called.');
        if (selectedPriorities.length === 0) {
            Alert.alert('Select Priorities', 'Please select at least one priority to continue.');
            return;
        }

        setLoading(true);
        try {
            // --- DEBUG LOG ---
            console.log('[PrioritySelectionScreen] Attempting to call completeOnboarding with:', selectedPriorities);
            await completeOnboarding(selectedPriorities);
            // --- DEBUG LOG ---
            console.log('[PrioritySelectionScreen] completeOnboarding finished successfully.');
        } catch (error) {
            // --- DEBUG LOG ---
            console.error('[PrioritySelectionScreen] Error calling completeOnboarding:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
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
                                selectedPriorities.includes(priority.id) && styles.priorityCardSelected,
                            ]}
                            onPress={() => togglePriority(priority.id)}
                            activeOpacity={0.8}
                        >
                            <Checkbox.Android
                                status={selectedPriorities.includes(priority.id) ? 'checked' : 'unchecked'}
                                color={colors.primary}
                            />
                            <Text style={[
                                styles.priorityText,
                                selectedPriorities.includes(priority.id) && styles.priorityTextSelected,
                            ]}>
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
                        labelStyle={{color: 'white'}}
                    >
                        Complete Setup
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PrioritySelectionScreen;
