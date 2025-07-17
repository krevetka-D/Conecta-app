// frontend/src/screens/main/DashboardScreen.js

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import apiClient from '../../services/api/client';
import { useApp } from '../../store/contexts/AppContext';
import { dashboardStyles as styles } from '../../styles/screens/main/DashboardScreenStyles';
import { colors } from '../../constants/theme';

const DashboardScreen = () => {
    const { isOnline } = useApp();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null);

    const loadDashboardData = useCallback(async () => {
        if (!refreshing) setLoading(true);
        setError(null);

        try {
            const response = await apiClient.get('/dashboard/events');
            const fetchedEvents = response?.data?.events || [];
            setEvents(fetchedEvents);
        } catch (err) {
            console.error('Error loading dashboard data:', err);
            setError('Could not load dashboard events. Pull down to retry.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [isOnline, refreshing]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
    }, []);

    useEffect(() => {
        if (refreshing) {
            loadDashboardData();
        }
    }, [refreshing, loadDashboardData]);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error && events.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={events}
                keyExtractor={(item) => item.id.toString()}
                style={{ width: '100%' }}
                contentContainerStyle={styles.listContentContainer}
                renderItem={({ item }) => (
                    <View style={styles.eventItem}>
                        <Text style={styles.eventTitle}>{item.title}</Text>
                        <Text style={styles.eventDetails}>{item.details}</Text>
                    </View>
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]}/>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No dashboard events found.</Text>
                    </View>
                }
            />
        </View>
    );
};

export default DashboardScreen;