// src/screens/main/DashboardScreen.js
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';

import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../store/contexts/AuthContext';
import { useApp } from '../../store/contexts/AppContext';
import { styles } from '../../styles/screens/main/DashboardScreenStyles';
import { colors } from '../../constants/theme';
import { SCREEN_NAMES } from '../../constants/routes';
import { runAfterInteractions } from '../../utils/performance';

const DashboardScreen = ({ navigation }) => {
    const { user } = useAuth();
    const { isOnline } = useApp();
    const [refreshing, setRefreshing] = useState(false);
    const [events, setEvents] = useState([
        {
            id: 1,
            title: 'Digital Nomads Weekly Meetup',
            date: new Date(2024, 11, 20, 18, 0),
            location: 'Playa del Postiguet',
            attendees: 25,
        },
        {
            id: 2,
            title: 'Startup Pitch Night',
            date: new Date(2024, 11, 22, 19, 30),
            location: 'District Digital',
            attendees: 40,
        },
    ]);

    useEffect(() => {
        runAfterInteractions(() => {
            // Load additional data after screen transition
            loadDashboardData();
        });
    }, []);

    const loadDashboardData = useCallback(async () => {
        // Simulate loading dashboard data
        try {
            // API calls would go here
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadDashboardData();
        setTimeout(() => setRefreshing(false), 1000);
    }, [loadDashboardData]);

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
            <Card
                key={moduleId}
                onPress={config.onPress}
                style={styles.pinnedCard}
            >
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
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={colors.primary}
                />
            }
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={styles.greeting}>Hello, {user?.name}!</Text>
                <Text style={styles.subGreeting}>
                    {user?.professionalPath === 'FREELANCER'
                        ? 'Your freelance journey in Alicante'
                        : 'Building your startup in Alicante'}
                </Text>
                {!isOnline && (
                    <Badge
                        text="Offline Mode"
                        variant="warning"
                        style={styles.offlineBadge}
                    />
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Priorities</Text>
                <View style={styles.pinnedModules}>
                    {user?.pinnedModules?.map(renderPinnedModule)}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Upcoming Events</Text>
                {events.map((event) => (
                    <Card key={event.id} style={styles.eventCard}>
                        <View style={styles.eventHeader}>
                            <View style={styles.eventInfo}>
                                <Text style={styles.eventTitle}>{event.title}</Text>
                                <Text style={styles.eventDate}>
                                    {format(event.date, 'EEEE, MMM d · h:mm a')}
                                </Text>
                                <View style={styles.eventLocationRow}>
                                    <Icon name="map-marker" size={14} color={colors.textSecondary} />
                                    <Text style={styles.eventLocation}>{event.location}</Text>
                                </View>
                            </View>
                            <Badge
                                text={`${event.attendees}`}
                                icon={<Icon name="account-group" size={16} color={colors.primary} />}
                                variant="primary"
                            />
                        </View>
                    </Card>
                ))}
            </View>

            <View style={styles.quickActions}>
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
        </ScrollView>
    );
};

export default React.memo(DashboardScreen);