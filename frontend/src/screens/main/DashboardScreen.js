import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    RefreshControl, 
    TouchableOpacity,
    FlatList,
    ActivityIndicator 
} from 'react-native';
import { Card } from 'react-native-paper';
import Icon from '../../components/common/Icon.js';
import { format } from 'date-fns';

import { useAuth } from '../../store/contexts/AuthContext';
import { useTheme } from '../../store/contexts/ThemeContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import eventService from '../../services/eventService';
import budgetService from '../../services/budgetService';
import checklistService from '../../services/checklistService';
import { formatCurrency } from '../../utils/formatting';
import { enhancedDashboardStyles } from '../../styles/screens/main/EnhancedDashboardStyles';

const DashboardScreen = ({ navigation }) => {
    const theme = useTheme();
    const styles = enhancedDashboardStyles(theme);
    const { user } = useAuth();
    
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState({
        upcomingEvents: [],
        budgetSummary: null,
        checklistProgress: null,
        recentForumActivity: []
    });

    const loadDashboardData = useCallback(async () => {
        try {
            // Load all dashboard data in parallel
            const [eventsData, budgetData, checklistData] = await Promise.all([
                eventService.getUpcomingEvents(5).catch(() => []),
                budgetService.getBudgetSummary('month').catch(() => null),
                checklistService.getChecklist().catch(() => [])
            ]);

            // Calculate checklist progress
            const checklistProgress = checklistData.length > 0 
                ? Math.round((checklistData.filter(item => item.isCompleted).length / checklistData.length) * 100)
                : 0;

            setDashboardData({
                upcomingEvents: eventsData || [],
                budgetSummary: budgetData,
                checklistProgress,
                recentForumActivity: [] // Placeholder for forum activity
            });
        } catch (error) {
            console.error("Failed to load dashboard data", error);
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

    const renderEventCard = ({ item }) => {
        const eventDate = new Date(item.date);
        
        return (
            <TouchableOpacity 
                style={styles.eventCard} 
                onPress={() => navigation.navigate('Events', { 
                    screen: 'EventDetail', 
                    params: { eventId: item._id }
                })}
                activeOpacity={0.7}
            >
                <View style={styles.eventDateBadge}>
                    <Text style={styles.eventDateDay}>{format(eventDate, 'dd')}</Text>
                    <Text style={styles.eventDateMonth}>{format(eventDate, 'MMM')}</Text>
                </View>
                <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
                    <View style={styles.eventMeta}>
                        <Icon name="clock-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.eventTime}>{item.time}</Text>
                    </View>
                    <View style={styles.eventMeta}>
                        <Icon name="map-marker-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.eventLocation} numberOfLines={1}>{item.location?.name}</Text>
                    </View>
                    {item.attendees && (
                        <View style={styles.eventAttendees}>
                            <Icon name="account-group-outline" size={14} color={theme.colors.textSecondary} />
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
                    tintColor={theme.colors.primary} 
                />
            }
            showsVerticalScrollIndicator={false}
        >
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
                <View>
                    <Text style={styles.welcomeText}>Welcome back,</Text>
                    <Text style={styles.userName}>{user?.name || 'User'}!</Text>
                </View>
                <TouchableOpacity 
                    style={styles.profileButton}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Icon name="account-circle" size={40} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
                <Card style={styles.statCard}>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('Budget')}
                        style={styles.statContent}
                    >
                        <Icon name="wallet" size={32} color={theme.colors.primary} />
                        <Text style={styles.statNumber}>
                            {budgetSummary ? formatCurrency(budgetSummary.balance) : '€0'}
                        </Text>
                        <Text style={styles.statLabel}>Monthly Balance</Text>
                    </TouchableOpacity>
                </Card>

                <Card style={styles.statCard}>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('Checklist')}
                        style={styles.statContent}
                    >
                        <Icon name="clipboard-check" size={32} color={theme.colors.success} />
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
                            onPress={() => navigation.navigate('Events')}
                        >
                            <Text style={styles.viewAllText}>View All</Text>
                            <Icon name="chevron-right" size={20} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </View>

                    {upcomingEvents.length > 0 ? (
                        <FlatList
                            data={upcomingEvents}
                            renderItem={renderEventCard}
                            keyExtractor={(item) => item._id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.eventsList}
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <Icon name="calendar-blank-outline" size={48} color={theme.colors.textSecondary} />
                            <Text style={styles.emptyStateText}>No upcoming events</Text>
                            <TouchableOpacity 
                                style={styles.emptyStateButton}
                                onPress={() => navigation.navigate('Events', { 
                                    screen: 'CreateEvent' 
                                })}
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
                            onPress={() => navigation.navigate('Budget')}
                        >
                            <Icon name="plus-circle" size={48} color={theme.colors.primary} />
                            <Text style={styles.quickActionText}>Add Entry</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate('Forums')}
                        >
                            <Icon name="forum" size={48} color={theme.colors.primary} />
                            <Text style={styles.quickActionText}>Forums</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate('Resources')}
                        >
                            <Icon name="book-open-variant" size={48} color={theme.colors.primary} />
                            <Text style={styles.quickActionText}>Guides</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate('Events', { 
                                screen: 'CreateEvent' 
                            })}
                        >
                            <Icon name="calendar-plus" size={48} color={theme.colors.primary} />
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
                                onPress={() => navigation.navigate('Budget')}
                            >
                                <Text style={styles.viewAllText}>Details</Text>
                                <Icon name="chevron-right" size={20} color={theme.colors.primary} />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.budgetSummary}>
                            <View style={styles.budgetItem}>
                                <Text style={styles.budgetLabel}>Income</Text>
                                <Text style={[styles.budgetAmount, { color: theme.colors.success }]}>
                                    {formatCurrency(budgetSummary.income?.total || 0)}
                                </Text>
                            </View>
                            <View style={styles.budgetDivider} />
                            <View style={styles.budgetItem}>
                                <Text style={styles.budgetLabel}>Expenses</Text>
                                <Text style={[styles.budgetAmount, { color: theme.colors.error }]}>
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