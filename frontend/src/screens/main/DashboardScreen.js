// src/screens/main/DashboardScreen.js
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';

import { api } from '../../store/contexts/AppContext'; // Import the configured api
import { useAuth } from '../../store/contexts/AuthContext';
import { useApp } from '../../store/contexts/AppContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { styles } from '../../styles/screens/main/DashboardScreenStyles'; // Your styles
import { colors } from '../../constants/theme'; // For tintColor and icons
import { SCREEN_NAMES } from '../../constants/routes';

// --- Header Component ---
const DashboardHeader = React.memo(({ user, isOnline, navigation }) => {
    const renderPinnedModule = useCallback((moduleId) => {
        const moduleConfigs = {
            autonomo_checklist: {
                title: 'Autónomo Checklist',
                subtitle: '0/5 steps completed',
                icon: 'clipboard-check',
                onPress: () => navigation.navigate(SCREEN_NAMES.CHECKLIST),
            },
            tax_guides: {
                title: 'Tax Guides',
                subtitle: 'IVA & IRPF explained',
                icon: 'calculator',
                onPress: () => navigation.navigate(SCREEN_NAMES.RESOURCES),
            },
            coworking_finder: {
                title: 'Coworking Finder',
                subtitle: 'Top-rated spaces',
                icon: 'office-building',
                onPress: () => navigation.navigate(SCREEN_NAMES.RESOURCES),
            },
            company_formation: {
                title: "Founder's Checklist",
                subtitle: '0/4 steps completed',
                icon: 'domain',
                onPress: () => navigation.navigate(SCREEN_NAMES.CHECKLIST),
            },
            funding_guide: {
                title: 'Funding & Grants',
                subtitle: 'ENISA, ICO, and more',
                icon: 'cash',
                onPress: () => navigation.navigate(SCREEN_NAMES.RESOURCES),
            },
        };
        const config = moduleConfigs[moduleId];
        if (!config) return null;

        return (
            <Card key={moduleId} onPress={config.onPress} style={styles.pinnedCard}>
                <View style={styles.pinnedCardIcon}>
                    <Icon name={config.icon} size={24} color={colors.primary} />
                </View>
                <View style={styles.pinnedCardContent}>
                    <Text style={styles.pinnedCardTitle}>{config.title}</Text>
                    <Text style={styles.pinnedCardSubtitle}>{config.subtitle}</Text>
                </View>
                <Icon name="chevron-right" size={24} color={colors.textSecondary} />
            </Card>
        );
    }, [navigation]);

    return (
        <>
            <View style={styles.header}>
                <Text style={styles.greeting}>Hello, {user?.name}!</Text>
                <Text style={styles.subGreeting}>
                    {user?.professionalPath === 'FREELANCER'
                        ? 'Your freelance journey in Alicante'
                        : 'Building your startup in Alicante'}
                </Text>
                {!isOnline && (
                    <Badge text="Offline Mode" variant="warning" style={styles.offlineBadge} />
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Priorities</Text>
                <View style={styles.pinnedModules}>
                    {user?.pinnedModules?.map(renderPinnedModule)}
                </View>
            </View>
        </>
    );
});

// --- Event Item Component ---
const EventItem = React.memo(({ item }) => (
    <Card style={styles.eventCard}>
        <View style={styles.eventHeader}>
            <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventDate}>
                    {format(new Date(item.date), 'EEEE, MMM d · h:mm a')}
                </Text>
                <View style={styles.eventLocationRow}>
                    <Icon name="map-marker" size={14} color={colors.textSecondary} />
                    <Text style={styles.eventLocation}>{item.location}</Text>
                </View>
            </View>
            <Badge
                text={`${item.attendees}`}
                icon={<Icon name="account-group" size={16} color={colors.primary} />}
                variant="primary"
            />
        </View>
    </Card>
));

// --- Footer Component ---
const DashboardFooter = React.memo(({ navigation }) => {
    const quickActions = useMemo(() => [
        {
            icon: 'currency-eur',
            text: 'Add Income',
            onPress: () => navigation.navigate(SCREEN_NAMES.BUDGET, { type: 'income' }),
        },
        {
            icon: 'receipt',
            text: 'Log Expense',
            onPress: () => navigation.navigate(SCREEN_NAMES.BUDGET, { type: 'expense' }),
        },
        {
            icon: 'book-open-variant',
            text: 'Browse Guides',
            onPress: () => navigation.navigate(SCREEN_NAMES.RESOURCES),
        },
        {
            icon: 'phone',
            text: 'Find Services',
            onPress: () => navigation.navigate(SCREEN_NAMES.RESOURCES, { tab: 'directory' }),
        },
    ], [navigation]);

    return (
        <View style={[styles.section, styles.quickActions]}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionGrid}>
                {quickActions.map((action, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.actionButton}
                        onPress={action.onPress}
                        activeOpacity={0.8}
                    >
                        <Icon name={action.icon} size={28} color={colors.primary} />
                        <Text style={styles.actionText}>{action.text}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
});

// --- Main Dashboard Screen ---
const DashboardScreen = ({ navigation }) => {
    const { user } = useAuth();
    const { isOnline } = useApp();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null);

    const loadDashboardData = useCallback(async () => {
        if (!isOnline) {
            setError("You're offline. Data may be outdated.");
            // Don't set loading to false immediately, to avoid flash of old content
        }
        try {
            setError(null);
            const response = await api.get('/dashboard/events');
            setEvents(response.data.events || []);
        } catch (err) {
            console.error('Error loading dashboard data:', err);
            setError('Could not load events. Please pull to retry.');
        } finally {
            setLoading(false);
        }
    }, [isOnline]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
    }, [loadDashboardData]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    // This defines the entire scrollable list content.
    const listSections = [
        { type: 'header', key: 'header' },
        { type: 'events_title', key: 'events_title' },
        ...events.map(event => ({ type: 'event', key: `event-${event.id}`, data: event })),
        { type: 'footer', key: 'footer' }
    ];

    return (
        <FlatList
            data={events}
            keyExtractor={(item) => item.id.toString()}
            style={styles.container}
            renderItem={({ item }) => <EventItem item={item} />}
            // Header contains greeting and pinned modules
            ListHeaderComponent={
                <>
                    <DashboardHeader user={user} isOnline={isOnline} navigation={navigation} />
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Upcoming Events</Text>
                    </View>
                </>
            }
            // Footer contains quick actions
            ListFooterComponent={<DashboardFooter navigation={navigation} />}
            // Handle case where there are no events to show
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    {error ? (
                        <Text style={styles.emptyText}>{error}</Text>
                    ) : (
                        <Text style={styles.emptyText}>No upcoming events found.</Text>
                    )}
                </View>
            }
            // Add pull-to-refresh functionality
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={colors.primary}
                />
            }
        />
    );
};

export default React.memo(DashboardScreen);