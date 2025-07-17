import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import apiClient from '../../services/api/client';
import { useApp } from '../../store/contexts/AppContext';
// Import your theme constants directly
import { colors, spacing, fonts, borderRadius, shadows } from '../../constants/theme';

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

// --- STYLES USING THE CORRECT PROPERTY NAMES FROM YOUR theme.js ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    listContentContainer: {
        flexGrow: 1,
        padding: spacing.md,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: colors.error, // FIX: Was 'danger'
        fontSize: fonts.sizes.md, // FIX: Was 'fonts.size.medium'
        fontFamily: fonts.families.regular,
        textAlign: 'center',
        padding: spacing.lg, // FIX: Was 'large'
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: fonts.sizes.md, // FIX: Was 'fonts.size.medium'
        fontFamily: fonts.families.regular,
    },
    eventItem: {
        backgroundColor: colors.cardBackground, // FIX: Was 'card'
        padding: spacing.md, // FIX: Was 'medium'
        marginBottom: spacing.md,
        borderRadius: borderRadius.md, // Using borderRadius from your theme
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.md, // Using shadows from your theme
    },
    eventTitle: {
        fontSize: fonts.sizes.lg, // FIX: Was 'fonts.size.medium'
        fontFamily: fonts.families.semiBold,
        color: colors.text,
    },
    eventDetails: {
        fontSize: fonts.sizes.sm, // FIX: Was 'fonts.size.small'
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        marginTop: spacing.sm, // FIX: Was 'xsmall'
    },
});

export default DashboardScreen;