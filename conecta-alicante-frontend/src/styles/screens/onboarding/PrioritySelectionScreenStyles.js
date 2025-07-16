import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Alert,
} from 'react-native';
import { Button, Checkbox } from 'react-native-paper';
import { useAuth } from '../../../store/contexts/AuthContext';
import { colors } from '../../../constants/theme';
import { PROFESSIONAL_PATHS } from '../../../constants/config';

const PrioritySelectionScreenStyles = ({ route }) => {
    const { professionalPath } = route.params;
    const { updateOnboarding } = useAuth();
    const [selectedPriorities, setSelectedPriorities] = useState([]);
    const [loading, setLoading] = useState(false);

    const priorities = professionalPath === PROFESSIONAL_PATHS.FREELANCER
        ? [
            { id: 'autonomo_checklist', title: "Register as 'Autónomo'", icon: 'file-document' },
            { id: 'tax_guides', title: 'Understand my tax obligations', icon: 'calculator' },
            { id: 'coworking_finder', title: 'Find a coworking space', icon: 'office-building' },
            { id: 'bank_account', title: 'Open a Spanish bank account', icon: 'bank' },
            { id: 'networking', title: 'Network with other freelancers', icon: 'account-group' },
        ]
        : [
            { id: 'company_formation', title: 'Form a company (S.L.)', icon: 'domain' },
            { id: 'funding_guide', title: 'Find investors or grants', icon: 'cash' },
            { id: 'legal_help', title: 'Get legal assistance', icon: 'scale-balance' },
            { id: 'office_space', title: 'Find office space', icon: 'office-building' },
            { id: 'hiring', title: 'Learn about hiring in Spain', icon: 'account-multiple-plus' },
        ];

    const togglePriority = (priorityId) => {
        if (selectedPriorities.includes(priorityId)) {
            setSelectedPriorities(selectedPriorities.filter(id => id !== priorityId));
        } else if (selectedPriorities.length < 3) {
            setSelectedPriorities([...selectedPriorities, priorityId]);
        } else {
            Alert.alert('Limit Reached', 'You can select up to 3 priorities. Deselect one to add another.');
        }
    };

    const handleComplete = async () => {
        if (selectedPriorities.length === 0) {
            Alert.alert('Select Priorities', 'Please select at least one priority to continue.');
            return;
        }

        setLoading(true);
        try {
            await updateOnboarding(professionalPath, selectedPriorities);
        } catch (error) {
            Alert.alert('Error', error.message);
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
                        Select up to 3 priorities and we'll pin them to your dashboard
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
                            <Checkbox
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
                    <Text style={styles.footerText}>
                        Don't worry, you can always change these later
                    </Text>
                    <Button
                        mode="contained"
                        onPress={handleComplete}
                        loading={loading}
                        disabled={loading || selectedPriorities.length === 0}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    header: {
        marginBottom: 30,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        color: colors.text,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: colors.textSecondary,
        lineHeight: 24,
    },
    prioritiesContainer: {
        marginBottom: 40,
    },
    priorityCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    priorityCardSelected: {
        borderColor: colors.primary,
        backgroundColor: '#F0F9FF',
    },
    priorityText: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: colors.text,
        marginLeft: 12,
    },
    priorityTextSelected: {
        fontFamily: 'Poppins-SemiBold',
        color: colors.primary,
    },
    footer: {
        marginBottom: 40,
    },
    footerText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 20,
    },
    completeButton: {
        borderRadius: 30,
    },
    completeButtonContent: {
        paddingVertical: 8,
    },
});

export default PrioritySelectionScreenStyles;