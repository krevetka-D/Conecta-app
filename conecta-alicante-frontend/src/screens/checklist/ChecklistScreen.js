import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Card, Checkbox, ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../store/contexts/AuthContext';
import { colors } from '../../constants/theme';
import { CHECKLIST_ITEMS } from '../../constants/config';
import checklistService from '../../services/checklistService';

const ChecklistScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [checklistData, setChecklistData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadChecklist();
    }, []);

    const loadChecklist = async () => {
        setLoading(true);
        try {
            const data = await checklistService.getChecklist();
            setChecklistData(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load checklist');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (itemKey, currentStatus) => {
        try {
            await checklistService.updateChecklistItem(itemKey, !currentStatus);
            await loadChecklist();
        } catch (error) {
            Alert.alert('Error', 'Failed to update checklist item');
        }
    };

    const getChecklistInfo = () => {
        const items = user?.professionalPath === 'FREELANCER'
            ? CHECKLIST_ITEMS.FREELANCER
            : CHECKLIST_ITEMS.ENTREPRENEUR;

        const completedCount = checklistData.filter(item => item.isCompleted).length;
        const progress = items.length > 0 ? completedCount / items.length : 0;

        return { items, completedCount, progress };
    };

    const { items, completedCount, progress } = getChecklistInfo();

    return (
        <ScrollView style={styles.container}>
            {/* Progress Section */}
            <View style={styles.progressSection}>
                <Text style={styles.progressTitle}>Your Progress</Text>
                <Text style={styles.progressText}>
                    {completedCount} of {items.length} steps completed
                </Text>
                <ProgressBar
                    progress={progress}
                    color={colors.primary}
                    style={styles.progressBar}
                />
            </View>

            {/* Checklist Items */}
            <View style={styles.checklistSection}>
                {items.map((item) => {
                    const checklistItem = checklistData.find(d => d.itemKey === item.key);
                    const isCompleted = checklistItem?.isCompleted || false;

                    return (
                        <Card key={item.key} style={[
                            styles.checklistCard,
                            isCompleted && styles.completedCard
                        ]}>
                            <TouchableOpacity
                                onPress={() => handleToggle(item.key, isCompleted)}
                                style={styles.cardContent}
                            >
                                <Checkbox
                                    status={isCompleted ? 'checked' : 'unchecked'}
                                    color={colors.primary}
                                />
                                <View style={styles.cardTextContainer}>
                                    <Text style={[
                                        styles.cardTitle,
                                        isCompleted && styles.completedText
                                    ]}>
                                        {item.title}
                                    </Text>
                                    <Text style={styles.cardDescription}>
                                        {item.description}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        // Navigate to relevant guide
                                        navigation.navigate('Resources');
                                    }}
                                    style={styles.infoButton}
                                >
                                    <Icon name="information-outline" size={24} color={colors.primary} />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        </Card>
                    );
                })}
            </View>

            {/* Tips Section */}
            <View style={styles.tipsSection}>
                <Card style={styles.tipCard}>
                    <Card.Content>
                        <View style={styles.tipHeader}>
                            <Icon name="lightbulb-outline" size={24} color={colors.warning} />
                            <Text style={styles.tipTitle}>Pro Tip</Text>
                        </View>
                        <Text style={styles.tipText}>
                            {user?.professionalPath === 'FREELANCER'
                                ? "Start with obtaining your NIE - it's required for all other steps!"
                                : "Consider consulting with a gestor for company formation - they can handle most of the paperwork."}
                        </Text>
                    </Card.Content>
                </Card>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    progressSection: {
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    progressTitle: {
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        color: colors.text,
        marginBottom: 8,
    },
    progressText: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: colors.textSecondary,
        marginBottom: 16,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
    },
    checklistSection: {
        padding: 20,
    },
    checklistCard: {
        marginBottom: 12,
        borderRadius: 12,
    },
    completedCard: {
        opacity: 0.8,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    cardTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: colors.text,
        marginBottom: 4,
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: colors.textSecondary,
    },
    cardDescription: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: colors.textSecondary,
    },
    infoButton: {
        padding: 8,
    },
    tipsSection: {
        padding: 20,
        paddingTop: 0,
    },
    tipCard: {
        borderRadius: 12,
        backgroundColor: '#FEF3C7',
    },
    tipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    tipTitle: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: colors.text,
        marginLeft: 8,
    },
    tipText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: colors.text,
        lineHeight: 20,
    },
});

export default ChecklistScreen;