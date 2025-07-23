import { format } from 'date-fns';
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
} from 'react-native';
import { Card, FAB, Chip, Avatar } from 'react-native-paper';

import EmptyState from '../../components/common/EmptyState';
import Icon from '../../components/common/Icon.js';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { colors, fonts, spacing } from '../../constants/theme';
import eventService from '../../services/eventService';
import socketService from '../../services/socketService';
import apiClient from '../../services/api/client';
import { useAuth } from '../../store/contexts/AuthContext';
import { showErrorAlert } from '../../utils/alerts';
import { devLog } from '../../utils/devLog';
import { useSocketEvents } from '../../hooks/useSocketEvents';

const EventsScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('upcoming'); // 'upcoming', 'past', 'myEvents'
    
    const loadEvents = useCallback(async () => {
        try {
            const params = {
                upcoming: filter === 'upcoming' ? 'true' : undefined,
                myEvents: filter === 'myEvents' ? 'true' : undefined,
            };

            const data = await eventService.getEvents(params);
            setEvents(data || []);
        } catch (error) {
            console.error('Failed to load events:', error);
            if (!refreshing) {
                showErrorAlert('Error', 'Failed to load events');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filter, refreshing]);

    // Socket event handlers
    const socketEventHandlers = {
        'event_update': useCallback((data) => {
            devLog('Events', 'Received real-time update:', data);
            
            // Clear API cache for events
            apiClient.clearCache('/events');
            if (data.event?._id) {
                apiClient.clearCache(`/events/${data.event._id}`);
            }
            
            if (data.type === 'create') {
                // Reload events to get fresh data with proper filtering
                loadEvents();
            } else if (data.type === 'update') {
                // Update existing event
                setEvents(prevEvents => 
                    prevEvents.map(event => 
                        event._id === data.event._id ? data.event : event
                    )
                );
            } else if (data.type === 'delete') {
                // Remove deleted event
                setEvents(prevEvents => 
                    prevEvents.filter(event => event._id !== data.eventId)
                );
            }
        }, [loadEvents])
    };
    
    // Use socket events hook
    useSocketEvents(socketEventHandlers, [loadEvents]);
    
    useEffect(() => {
        loadEvents();
    }, [filter, loadEvents]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadEvents();
    }, [loadEvents]);

    const handleEventPress = (event) => {
        navigation.navigate('EventDetail', { eventId: event._id });
    };

    const handleCreateEvent = () => {
        navigation.navigate('CreateEvent');
    };

    const renderEventItem = ({ item }) => {
        const eventDate = new Date(item.date);
        const isAttending = item.attendees?.some((att) => att === user?._id);
        const isFull = item.maxAttendees && item.attendees?.length >= item.maxAttendees;

        return (
            <TouchableOpacity onPress={() => handleEventPress(item)} activeOpacity={0.7}>
                <Card style={styles.eventCard}>
                    <View style={styles.cardContentWrapper}>
                        <Card.Content>
                            <View style={styles.eventHeader}>
                                <View style={styles.eventDateBadge}>
                                    <Text style={styles.eventDateDay}>
                                        {format(eventDate, 'dd')}
                                    </Text>
                                    <Text style={styles.eventDateMonth}>
                                        {format(eventDate, 'MMM')}
                                    </Text>
                                </View>
                                <View style={styles.eventInfo}>
                                    <Text style={styles.eventTitle} numberOfLines={2}>
                                        {item.title}
                                    </Text>
                                    <View style={styles.eventMeta}>
                                        <Icon
                                            name="clock-outline"
                                            size={14}
                                            color={colors.textSecondary}
                                        />
                                        <Text style={styles.eventTime}>{item.time}</Text>
                                        <Icon
                                            name="map-marker-outline"
                                            size={14}
                                            color={colors.textSecondary}
                                            style={styles.metaIcon}
                                        />
                                        <Text style={styles.eventLocation} numberOfLines={1}>
                                            {item.location.name}
                                        </Text>
                                    </View>
                                    <View style={styles.eventFooter}>
                                        <View style={styles.attendeesPreview}>
                                            <Icon
                                                name="account-group"
                                                size={16}
                                                color={colors.textSecondary}
                                            />
                                            <Text style={styles.attendeesCount}>
                                                {item.attendees?.length || 0}
                                                {item.maxAttendees && ` / ${item.maxAttendees}`}
                                            </Text>
                                        </View>
                                        <View style={styles.eventTags}>
                                            {isAttending && (
                                                <Chip
                                                    style={styles.attendingChip}
                                                    textStyle={styles.chipText}
                                                >
                                                    Attending
                                                </Chip>
                                            )}
                                            {isFull && !isAttending && (
                                                <Chip
                                                    style={styles.fullChip}
                                                    textStyle={styles.chipText}
                                                >
                                                    Full
                                                </Chip>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </Card.Content>
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    if (loading && !refreshing) {
        return <LoadingSpinner fullScreen text="Loading events..." />;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Events</Text>
                    <View style={styles.filterContainer}>
                        <TouchableOpacity
                            style={[
                                styles.filterChip,
                                filter === 'upcoming' && styles.filterChipActive,
                            ]}
                            onPress={() => setFilter('upcoming')}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    filter === 'upcoming' && styles.filterTextActive,
                                ]}
                            >
                                Upcoming
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.filterChip,
                                filter === 'past' && styles.filterChipActive,
                            ]}
                            onPress={() => setFilter('past')}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    filter === 'past' && styles.filterTextActive,
                                ]}
                            >
                                Past
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.filterChip,
                                filter === 'myEvents' && styles.filterChipActive,
                            ]}
                            onPress={() => setFilter('myEvents')}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    filter === 'myEvents' && styles.filterTextActive,
                                ]}
                            >
                                My Events
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <FlatList
                    data={events}
                    renderItem={renderEventItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <EmptyState
                            icon="calendar-blank-outline"
                            title={filter === 'myEvents' ? 'No events yet' : 'No upcoming events'}
                            message={
                                filter === 'myEvents'
                                    ? 'Events you create or join will appear here'
                                    : 'Check back later or create your own event!'
                            }
                            action={
                                <TouchableOpacity
                                    style={styles.createButton}
                                    onPress={handleCreateEvent}
                                >
                                    <Text style={styles.createButtonText}>Create Event</Text>
                                </TouchableOpacity>
                            }
                        />
                    }
                />

                <FAB
                    icon="plus"
                    style={styles.fab}
                    onPress={handleCreateEvent}
                    color={colors.textInverse}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.md,
    },
    filterContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    filterChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    filterChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterText: {
        fontSize: 14,
        color: colors.text,
    },
    filterTextActive: {
        color: colors.textInverse,
        fontWeight: 'bold',
    },
    listContent: {
        padding: spacing.md,
    },
    eventCard: {
        marginBottom: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: 12,
        elevation: 2,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardContentWrapper: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    eventHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    eventDateBadge: {
        width: 60,
        height: 60,
        backgroundColor: colors.primary,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    eventDateDay: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textInverse,
    },
    eventDateMonth: {
        fontSize: 12,
        color: colors.textInverse,
        textTransform: 'uppercase',
    },
    eventInfo: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    eventMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    eventTime: {
        fontSize: 14,
        color: colors.textSecondary,
        marginLeft: spacing.xs,
        marginRight: spacing.md,
    },
    metaIcon: {
        marginLeft: spacing.sm,
    },
    eventLocation: {
        fontSize: 14,
        color: colors.textSecondary,
        marginLeft: spacing.xs,
        flex: 1,
    },
    eventFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.sm,
    },
    attendeesPreview: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    attendeesCount: {
        fontSize: 14,
        color: colors.textSecondary,
        marginLeft: spacing.xs,
    },
    eventTags: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    attendingChip: {
        height: 24,
        backgroundColor: colors.primary,
    },
    fullChip: {
        height: 24,
        backgroundColor: colors.error,
    },
    chipText: {
        fontSize: 12,
        color: colors.textInverse,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: colors.primary,
    },
    createButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: 30,
        marginTop: spacing.md,
    },
    createButtonText: {
        color: colors.textInverse,
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default React.memo(EventsScreen);
