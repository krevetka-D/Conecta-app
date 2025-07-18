// frontend/src/screens/main/DashboardScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuth } from '../../store/contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
// Import the style FUNCTION
import { dashboardStyles } from '../../styles/screens/main/DashboardScreenStyles';

const DashboardScreen = ({ navigation }) => {
    // Get theme and create styles at runtime
    const theme = useTheme();
    const styles = dashboardStyles(theme);

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
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        >
            <View style={styles.header}>
                <Text style={styles.welcomeText}>Welcome, {user?.name || 'User'}!</Text>
                <Text style={styles.welcomeSubtext}>Here's your summary for today.</Text>
            </View>

            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Budget')}>
                    <View style={styles.actionIconContainer}>
                        <Icon name="wallet" size={30} color={theme.colors.onPrimary} />
                    </View>
                    <Text style={styles.actionText}>My Budget</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Checklist')}>
                     <View style={styles.actionIconContainer}>
                        <Icon name="check-circle-outline" size={30} color={theme.colors.onPrimary} />
                    </View>
                    <Text style={styles.actionText}>My Checklist</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Forums')}>
                     <View style={styles.actionIconContainer}>
                        <Icon name="forum" size={30} color={theme.colors.onPrimary} />
                    </View>
                    <Text style={styles.actionText}>Community</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Upcoming Events</Text>
                <View style={styles.cardContent}>
                    {/* Replace with actual event data */}
                    <View style={styles.emptyStateContainer}>
                        <Icon name="calendar-blank" size={40} color={theme.colors.textSecondary} />
                        <Text style={styles.emptyStateText}>No upcoming events.</Text>
                    </View>
                </View>
            </View>

        </ScrollView>
    );
};

export default DashboardScreen;
