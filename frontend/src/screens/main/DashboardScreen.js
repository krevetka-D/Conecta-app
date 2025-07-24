import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, FlatList } from 'react-native';
import { Card } from 'react-native-paper';

import Icon from '../../components/common/Icon.js';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { SCREEN_NAMES } from '../../constants/routes';
import apiClient from '../../services/api/client';
import budgetService from '../../services/budgetService';
import checklistService from '../../services/checklistService';
import eventService from '../../services/eventService';
import { useAuth } from '../../store/contexts/AuthContext';
import { useTheme } from '../../store/contexts/ThemeContext';
import { dashboardStyles } from '../../styles/screens/main/DashboardScreenStyles';
import { devError, devLog } from '../../utils';
import { formatCurrency } from '../../utils/formatting';
import { useSocketEvents } from '../../hooks/useSocketEvents';

// Simple date formatting function
const formatEventDate = (dateString) => {
    try {
        const date = new Date(dateString);
        const months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];
        return {
            day: date.getDate(),
            month: months[date.getMonth()],
        };
    } catch (error) {
        return { day: '?', month: '???' };
    }
};

const DashboardScreen = ({ navigation }) => {
    const theme = useTheme();
    const styles = React.useMemo(() => dashboardStyles(theme), [theme]);
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState({
        upcomingEvents: [],
        budgetSummary: null,
        checklistProgress: null,
        recentForumActivity: [],
    });

    const loadDashboardData = useCallback(async () => {
        try {
            // Clear events cache to ensure fresh data
            await apiClient.clearCache('/events');
            
            const [eventsResponse, budgetData, checklistData] = await Promise.all([
                eventService.getUpcomingEvents(5).catch(() => ({ events: [] })),
                budgetService.getBudgetSummary('month').catch(() => null),
                checklistService.getChecklist().catch(() => []),
            ]);

            const events = Array.isArray(eventsResponse)
                ? eventsResponse
                : eventsResponse?.events || [];

            const checklistProgress =
                checklistData.length > 0
                    ? Math.round(
                        (checklistData.filter((item) => item.isCompleted).length /
                              checklistData.length) *
                              100,
                    )
                    : 0;

            setDashboardData({
                upcomingEvents: events,
                budgetSummary: budgetData,
                checklistProgress,
                recentForumActivity: [],
            });
            
            devLog('Dashboard', `Loaded ${events.length} upcoming events`);
        } catch (error) {
            devError('Dashboard', 'Failed to load dashboard data', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadDashboardData();
    }, [loadDashboardData]);
    
    // Socket event handlers for real-time updates
    const socketEventHandlers = {
        'event_update': useCallback((data) => {
            devLog('Dashboard', 'Received event update:', data);
            
            // Clear cache and reload dashboard data when events change
            apiClient.clearCache('/events').then(() => {
                loadDashboardData();
            });
        }, [loadDashboardData]),
        
        'budget_update': useCallback((data) => {
            devLog('Dashboard', 'Received budget update:', data);
            
            // Clear cache and reload dashboard data when budget changes
            apiClient.clearCache('/budget').then(() => {
                loadDashboardData();
            });
        }, [loadDashboardData]),
    };
    
    // Use socket events hook
    useSocketEvents(socketEventHandlers, [loadDashboardData]);

    const renderEventCard = ({ item }) => {
        if (!item) return null;

        const { day, month } = formatEventDate(item.date);

        return (
            <TouchableOpacity
                style={styles.eventCard}
                onPress={() =>
                    navigation.navigate(SCREEN_NAMES.EVENTS, {
                        screen: 'EventDetail',
                        params: { eventId: item._id },
                    })
                }
                activeOpacity={0.7}
            >
                <View style={styles.eventDateBadge}>
                    <Text style={styles.eventDateDay}>{day}</Text>
                    <Text style={styles.eventDateMonth}>{month}</Text>
                </View>
                <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle} numberOfLines={1}>
                        {item.title || 'Untitled Event'}
                    </Text>
                    <View style={styles.eventMeta}>
                        <Icon
                            name="clock-outline"
                            size={14}
                            color={theme?.colors?.textSecondary || '#6B7280'}
                        />
                        <Text style={styles.eventTime}>{item.time || 'TBD'}</Text>
                    </View>
                    <View style={styles.eventMeta}>
                        <Icon
                            name="map-marker-outline"
                            size={14}
                            color={theme?.colors?.textSecondary || '#6B7280'}
                        />
                        <Text style={styles.eventLocation} numberOfLines={1}>
                            {item.location?.name || 'Location TBD'}
                        </Text>
                    </View>
                    {item.attendees && (
                        <View style={styles.eventAttendees}>
                            <Icon
                                name="account-group-outline"
                                size={14}
                                color={theme?.colors?.textSecondary || '#6B7280'}
                            />
                            <Text style={styles.eventAttendeesText}>
                                {item.attendees.length} attending
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return <LoadingSpinner fullScreen text="Loading Dashboard..." />;
    }

    const { upcomingEvents, budgetSummary, checklistProgress } = dashboardData;

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollView}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={theme?.colors?.primary || '#1E3A8A'}
                />
            }
            showsVerticalScrollIndicator={false}
        >
            {/* Header with only profile button */}
            <View style={styles.headerSection}>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate(SCREEN_NAMES.PROFILE)}
                >
                    <Icon
                        name="account-circle"
                        size={40}
                        color={theme?.colors?.primary || '#1E3A8A'}
                    />
                </TouchableOpacity>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
                <Card style={styles.statCard}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate(SCREEN_NAMES.BUDGET)}
                        style={styles.statContent}
                    >
                        <Icon name="wallet" size={32} color={theme?.colors?.primary || '#1E3A8A'} />
                        <Text style={styles.statNumber}>
                            {budgetSummary ? formatCurrency(budgetSummary.balance || 0) : '€0'}
                        </Text>
                        <Text style={styles.statLabel}>Monthly Balance</Text>
                    </TouchableOpacity>
                </Card>

                <Card style={styles.statCard}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate(SCREEN_NAMES.CHECKLIST)}
                        style={styles.statContent}
                    >
                        <Icon
                            name="clipboard-check"
                            size={32}
                            color={theme?.colors?.success || '#10B981'}
                        />
                        <Text style={styles.statNumber}>{checklistProgress}%</Text>
                        <Text style={styles.statLabel}>Tasks Complete</Text>
                    </TouchableOpacity>
                </Card>
            </View>

            {/* Upcoming Events */}
            <Card style={styles.sectionCard}>
                <Card.Content>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Upcoming Events</Text>
                        <TouchableOpacity
                            style={styles.viewAllButton}
                            onPress={() => navigation.navigate(SCREEN_NAMES.EVENTS)}
                        >
                            <Text style={styles.viewAllText}>View All</Text>
                            <Icon
                                name="chevron-right"
                                size={20}
                                color={theme?.colors?.primary || '#1E3A8A'}
                            />
                        </TouchableOpacity>
                    </View>

                    {upcomingEvents && upcomingEvents.length > 0 ? (
                        <FlatList
                            data={upcomingEvents}
                            renderItem={renderEventCard}
                            keyExtractor={(item) => item?._id || String(Math.random())}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.eventsList}
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <Icon
                                name="calendar-blank-outline"
                                size={48}
                                color={theme?.colors?.textSecondary || '#6B7280'}
                            />
                            <Text style={styles.emptyStateText}>No upcoming events</Text>
                            <TouchableOpacity
                                style={styles.emptyStateButton}
                                onPress={() =>
                                    navigation.navigate(SCREEN_NAMES.EVENTS, {
                                        screen: 'CreateEvent',
                                    })
                                }
                            >
                                <Text style={styles.emptyStateButtonText}>Create Event</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Card.Content>
            </Card>

            {/* Quick Actions */}
            <Card style={styles.sectionCard}>
                <Card.Content>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActions}>
                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate(SCREEN_NAMES.BUDGET)}
                        >
                            <Icon
                                name="plus-circle"
                                size={48}
                                color={theme?.colors?.primary || '#1E3A8A'}
                            />
                            <Text style={styles.quickActionText}>Add Entry</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate(SCREEN_NAMES.FORUMS)}
                        >
                            <Icon
                                name="forum"
                                size={48}
                                color={theme?.colors?.primary || '#1E3A8A'}
                            />
                            <Text style={styles.quickActionText}>Groups</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate(SCREEN_NAMES.RESOURCES)}
                        >
                            <Icon
                                name="book-open-variant"
                                size={48}
                                color={theme?.colors?.primary || '#1E3A8A'}
                            />
                            <Text style={styles.quickActionText}>Guides</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() =>
                                navigation.navigate(SCREEN_NAMES.EVENTS, {
                                    screen: 'CreateEvent',
                                })
                            }
                        >
                            <Icon
                                name="calendar-plus"
                                size={48}
                                color={theme?.colors?.primary || '#1E3A8A'}
                            />
                            <Text style={styles.quickActionText}>New Event</Text>
                        </TouchableOpacity>
                    </View>
                </Card.Content>
            </Card>

            {/* Budget Summary */}
            {budgetSummary && (
                <Card style={styles.sectionCard}>
                    <Card.Content>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>This Month</Text>
                            <TouchableOpacity
                                style={styles.viewAllButton}
                                onPress={() => navigation.navigate(SCREEN_NAMES.BUDGET)}
                            >
                                <Text style={styles.viewAllText}>Details</Text>
                                <Icon
                                    name="chevron-right"
                                    size={20}
                                    color={theme?.colors?.primary || '#1E3A8A'}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.budgetSummary}>
                            <View style={styles.budgetItem}>
                                <Text style={styles.budgetLabel}>Income</Text>
                                <Text style={[styles.budgetAmount, styles.incomeAmount]}>
                                    {formatCurrency(budgetSummary.income?.total || 0)}
                                </Text>
                            </View>
                            <View style={styles.budgetDivider} />
                            <View style={styles.budgetItem}>
                                <Text style={styles.budgetLabel}>Expenses</Text>
                                <Text style={[styles.budgetAmount, styles.expenseAmount]}>
                                    {formatCurrency(budgetSummary.expenses?.total || 0)}
                                </Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>
            )}
        </ScrollView>
    );
};

export default DashboardScreen;
