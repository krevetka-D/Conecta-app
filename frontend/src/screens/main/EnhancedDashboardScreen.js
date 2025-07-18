// frontend/src/screens/dashboard/EnhancedDashboardScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    FlatList,
    SafeAreaView,
    Platform,
} from 'react-native';
import { Card, Avatar, Badge, FAB, Portal, Provider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../store/contexts/AuthContext';
import { useTheme } from '../../store/contexts/ThemeContext';
import eventService from '../../services/eventService';
import forumService from '../../services/forumService';
import statsService from '../../services/statsService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { showErrorAlert } from '../../utils/alerts';
import { enhancedDashboardStyles } from '../../styles/screens/dashboard/EnhancedDashboardStyles';

const EnhancedDashboardScreen = () => {
    const theme = useTheme();
    const styles = enhancedDashboardStyles(theme);
    const navigation = useNavigation();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [recentForumActivity, setRecentForumActivity] = useState([]);
    const [userStats, setUserStats] = useState({
        eventsAttending: 0,
        eventsOrganized: 0,
        forumPosts: 0,
        connections: 0,
    });
    const [fabOpen, setFabOpen] = useState(false);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [events, forums, stats] = await Promise.all([
                eventService.getUpcomingEvents(5),
                forumService.getRecentActivity(5),
                statsService.getUserStats(user._id),
            ]);

            setUpcomingEvents(events);
            setRecentForumActivity(forums);
            setUserStats(stats);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            showErrorAlert('Error', 'Failed to load dashboard data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadDashboardData();
    }, []);

    const getEventDateLabel = (date) => {
        const eventDate = new Date(date);
        if (isToday(eventDate)) return 'Today';
        if (isTomorrow(eventDate)) return 'Tomorrow';
        if (isThisWeek(eventDate)) return format(eventDate, 'EEEE');
        return format(eventDate, 'MMM dd');
    };

    const renderUpcomingEvent = ({ item }) => (
        <TouchableOpacity
            style={styles.eventCard}
            onPress={() => navigation.navigate('EventDetail', { eventId: item._id })}
        >
            <View style={styles.eventDateBadge}>
                <Text style={styles.eventDateDay}>{format(new Date(item.date), 'dd')}</Text>
                <Text style={styles.eventDateMonth}>{format(new Date(item.date), 'MMM')}</Text>
            </View>
            <View style={styles.eventInfo}>
                <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.eventMeta}>
                    <Icon name="clock-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.eventTime}>{item.time}</Text>
                    <Icon name="map-marker" size={14} color={theme.colors.textSecondary} style={{ marginLeft: 10 }} />
                    <Text style={styles.eventLocation} numberOfLines={1}>{item.location.name}</Text>
                </View>
                <View style={styles.eventAttendees}>
                    <Icon name="account-group" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.eventAttendeesText}>
                        {item.attendees?.length || 0} attending
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderForumActivity = ({ item }) => (
        <TouchableOpacity
            style={styles.forumCard}
            onPress={() => navigation.navigate('ForumDetail', { forumId: item.forumId })}
        >
            <Avatar.Text size={40} label={item.author.name.charAt(0)} />
            <View style={styles.forumContent}>
                <Text style={styles.forumAuthor}>{item.author.name}</Text>
                <Text style={styles.forumAction}>
                    {item.type === 'post' ? 'posted in' : 'replied to'} {item.forumName}
                </Text>
                <Text style={styles.forumPreview} numberOfLines={2}>{item.content}</Text>
                <Text style={styles.forumTime}>{format(new Date(item.createdAt), 'h:mm a')}</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return <LoadingSpinner fullScreen text="Loading dashboard..." />;
    }

    return (
        <Provider>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    style={styles.container}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {/* Welcome Section */}
                    <View style={styles.welcomeSection}>
                        <View>
                            <Text style={styles.welcomeText}>Welcome back,</Text>
                            <Text style={styles.userName}>{user.name}!</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Profile')}
                            style={styles.profileButton}
                        >
                            <Avatar.Text size={50} label={user.name.charAt(0)} />
                            {user.hasNewNotifications && (
                                <Badge style={styles.notificationBadge} size={12} />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Stats Cards */}
                    <View style={styles.statsContainer}>
                        <Card style={styles.statCard}>
                            <Card.Content style={styles.statContent}>
                                <Icon name="calendar-check" size={24} color={theme.colors.primary} />
                                <Text style={styles.statNumber}>{userStats.eventsAttending}</Text>
                                <Text style={styles.statLabel}>Events Attending</Text>
                            </Card.Content>
                        </Card>

                        <Card style={styles.statCard}>
                            <Card.Content style={styles.statContent}>
                                <Icon name="calendar-star" size={24} color={theme.colors.secondary} />
                                <Text style={styles.statNumber}>{userStats.eventsOrganized}</Text>
                                <Text style={styles.statLabel}>Events Organized</Text>
                            </Card.Content>
                        </Card>

                        <Card style={styles.statCard}>
                            <Card.Content style={styles.statContent}>
                                <Icon name="forum" size={24} color={theme.colors.accent} />
                                <Text style={styles.statNumber}>{userStats.forumPosts}</Text>
                                <Text style={styles.statLabel}>Forum Posts</Text>
                            </Card.Content>
                        </Card>

                        <Card style={styles.statCard}>
                            <Card.Content style={styles.statContent}>
                                <Icon name="account-group" size={24} color={theme.colors.success} />
                                <Text style={styles.statNumber}>{userStats.connections}</Text>
                                <Text style={styles.statLabel}>Connections</Text>
                            </Card.Content>
                        </Card>
                    </View>

                    {/* Upcoming Events Widget */}
                    <Card style={styles.sectionCard}>
                        <Card.Content>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Upcoming Events</Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Events')}
                                    style={styles.viewAllButton}
                                >
                                    <Text style={styles.viewAllText}>View All</Text>
                                    <Icon name="chevron-right" size={20} color={theme.colors.primary} />
                                </TouchableOpacity>
                            </View>
                            
                            {upcomingEvents.length > 0 ? (
                                <FlatList
                                    data={upcomingEvents}
                                    renderItem={renderUpcomingEvent}
                                    keyExtractor={(item) => item._id}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.eventsList}
                                />
                            ) : (
                                <View style={styles.emptyState}>
                                    <Icon name="calendar-blank" size={48} color={theme.colors.textSecondary} />
                                    <Text style={styles.emptyStateText}>No upcoming events</Text>
                                    <TouchableOpacity
                                        style={styles.emptyStateButton}
                                        onPress={() => navigation.navigate('Events')}
                                    >
                                        <Text style={styles.emptyStateButtonText}>Browse Events</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </Card.Content>
                    </Card>

                    {/* Recent Forum Activity */}
                    <Card style={styles.sectionCard}>
                        <Card.Content>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Recent Forum Activity</Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Forums')}
                                    style={styles.viewAllButton}
                                >
                                    <Text style={styles.viewAllText}>View All</Text>
                                    <Icon name="chevron-right" size={20} color={theme.colors.primary} />
                                </TouchableOpacity>
                            </View>

                            {recentForumActivity.length > 0 ? (
                                <FlatList
                                    data={recentForumActivity}
                                    renderItem={renderForumActivity}
                                    keyExtractor={(item) => item._id}
                                    scrollEnabled={false}
                                    contentContainerStyle={styles.forumList}
                                />
                            ) : (
                                <View style={styles.emptyState}>
                                    <Icon name="forum-outline" size={48} color={theme.colors.textSecondary} />
                                    <Text style={styles.emptyStateText}>No recent activity</Text>
                                    <TouchableOpacity
                                        style={styles.emptyStateButton}
                                        onPress={() => navigation.navigate('Forums')}
                                    >
                                        <Text style={styles.emptyStateButtonText}>Join Discussion</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </Card.Content>
                    </Card>

                    {/* Quick Actions */}
                    <Card style={[styles.sectionCard, { marginBottom: 100 }]}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Quick Actions</Text>
                            <View style={styles.quickActions}>
                                <TouchableOpacity
                                    style={styles.quickActionButton}
                                    onPress={() => navigation.navigate('CreateEvent')}
                                >
                                    <Icon name="calendar-plus" size={28} color={theme.colors.primary} />
                                    <Text style={styles.quickActionText}>Create Event</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.quickActionButton}
                                    onPress={() => navigation.navigate('CreateForum')}
                                >
                                    <Icon name="forum-plus" size={28} color={theme.colors.secondary} />
                                    <Text style={styles.quickActionText}>Start Discussion</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.quickActionButton}
                                    onPress={() => navigation.navigate('Connections')}
                                >
                                    <Icon name="account-plus" size={28} color={theme.colors.accent} />
                                    <Text style={styles.quickActionText}>Find People</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.quickActionButton}
                                    onPress={() => navigation.navigate('Messages')}
                                >
                                    <Icon name="message-text" size={28} color={theme.colors.success} />
                                    <Text style={styles.quickActionText}>Messages</Text>
                                </TouchableOpacity>
                            </View>
                        </Card.Content>
                    </Card>
                </ScrollView>

                {/* Floating Action Button */}
                <Portal>
                    <FAB.Group
                        open={fabOpen}
                        visible
                        icon={fabOpen ? 'close' : 'plus'}
                        actions={[
                            {
                                icon: 'calendar-plus',
                                label: 'Create Event',
                                onPress: () => navigation.navigate('CreateEvent'),
                            },
                            {
                                icon: 'forum-plus',
                                label: 'Start Discussion',
                                onPress: () => navigation.navigate('CreateForum'),
                            },
                            {
                                icon: 'message-plus',
                                label: 'New Message',
                                onPress: () => navigation.navigate('NewMessage'),
                            },
                        ]}
                        onStateChange={({ open }) => setFabOpen(open)}
                        style={styles.fab}
                    />
                </Portal>
            </SafeAreaView>
        </Provider>
    );
};

export default React.memo(EnhancedDashboardScreen);