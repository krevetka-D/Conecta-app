

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import Icon from '../../components/common/Icon.js';

import { useAuth } from '../../store/contexts/AuthContext';
import { useTheme } from '../../store/contexts/ThemeContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { colors, spacing, fonts } from '../../constants/theme';

const DashboardScreen = ({ navigation }) => {
    const theme = useTheme();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);

    const loadData = useCallback(async () => {
        try {
            // This is where you would fetch dashboard-specific data in the future.
            // For example:
            // const data = await getDashboardData();
            // setDashboardData(data);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);

    if (loading) {
        return <LoadingSpinner fullScreen text="Loading Dashboard..." />;
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollView}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
            <View style={styles.header}>
                <Text style={styles.welcomeText}>Welcome, {user?.name || 'User'}!</Text>
                <Text style={styles.welcomeSubtext}>Here's your summary for today.</Text>
            </View>

            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Budget')}>
                    <View style={styles.actionIconContainer}>
                        <Icon name="wallet" size={30} color={colors.textInverse} />
                    </View>
                    <Text style={styles.actionText}>My Budget</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Checklist')}>
                     <View style={styles.actionIconContainer}>
                        <Icon name="check-circle" size={30} color={colors.textInverse} />
                    </View>
                    <Text style={styles.actionText}>My Checklist</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Forums')}>
                     <View style={styles.actionIconContainer}>
                        <Icon name="forum" size={30} color={colors.textInverse} />
                    </View>
                    <Text style={styles.actionText}>Community</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Upcoming Events</Text>
                <View style={styles.cardContent}>
                    {/* Replace with actual event data */}
                    <View style={styles.emptyStateContainer}>
                        <Icon name="calendar-blank" size={40} color={colors.textSecondary} />
                        <Text style={styles.emptyStateText}>No upcoming events.</Text>
                    </View>
                </View>
            </View>

        </ScrollView>
    );
};

// styles components
const styles = {
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        padding: spacing.md,
    },
    header: {
        marginBottom: spacing.lg,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        fontFamily: fonts.families.bold,
    },
    welcomeSubtext: {
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        fontFamily: fonts.families.regular,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.md,
        fontFamily: fonts.families.semiBold,
    },
    quickActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: spacing.lg,
    },
    actionButton: {
        alignItems: 'center',
    },
    actionIconContainer: {
        backgroundColor: colors.primary,
        borderRadius: 30,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    actionText: {
        color: colors.text,
        textAlign: 'center',
        fontFamily: fonts.families.regular,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        fontFamily: fonts.families.semiBold,
    },
    cardContent: {
        marginTop: spacing.md,
    },
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xl,
    },
    emptyStateText: {
        color: colors.textSecondary,
        marginTop: spacing.md,
        fontFamily: fonts.families.regular,
    },
};

export default DashboardScreen;