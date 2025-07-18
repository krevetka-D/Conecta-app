// frontend/src/screens/events/EventsScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    SafeAreaView,
} from 'react-native';
import { Card, FAB, Chip, Avatar } from 'react-native-paper';
import Icon from '../../components/common/Icon.js';
import { format } from 'date-fns';

import { useAuth } from '../../store/contexts/AuthContext';
import { useTheme } from '../../store/contexts/ThemeContext';
import { colors } from '../../constants/theme';
import eventService from '../../services/eventService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { showErrorAlert } from '../../utils/alerts';
import { eventsStyles } from '../../styles/screens/events/EventsScreenStyles';

const EventsScreen = ({ navigation }) => {
    const theme = useTheme();
    const styles = eventsStyles(theme);
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('upcoming'); // 'upcoming', 'past', 'myEvents'

    useEffect(() => {
        loadEvents();
    }, [filter]);

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
        const isAttending = item.attendees?.some(att => att === user?._id);
        const isFull = item.maxAttendees && item.attendees?.length >= item.maxAttendees;

        return (
            <TouchableOpacity onPress={() => handleEventPress(item)} activeOpacity={0.7}>
                <Card style={styles.eventCard}>
                    <Card.Content>
                        <View style={styles.eventHeader}>
                            <View style={styles.eventDateBadge}>
                                <Text style={styles.eventDateDay}>{format(eventDate, 'dd')}</Text>
                                <Text style={styles.eventDateMonth}>{format(eventDate, 'MMM')}</Text>
                            </View>
                            <View style={styles.eventInfo}>
                                <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
                                <View style={styles.eventMeta}>
                                    <Icon name="clock-outline" size={14} color={colors.textSecondary} />
                                    <Text style={styles.eventTime}>{item.time}</Text>
                                    <Icon name="map-marker-outline" size={14} color={colors.textSecondary} style={styles.metaIcon} />
                                    <Text style={styles.eventLocation} numberOfLines={1}>{item.location.name}</Text>
                                </View>
                                <View style={styles.eventFooter}>
                                    <View style={styles.attendeesPreview}>
                                        <Icon name="account-group" size={16} color={colors.textSecondary} />
                                        <Text style={styles.attendeesCount}>
                                            {item.attendees?.length || 0}
                                            {item.maxAttendees && ` / ${item.maxAttendees}`}
                                        </Text>
                                    </View>
                                    <View style={styles.eventTags}>
                                        {isAttending && (
                                            <Chip style={styles.attendingChip} textStyle={styles.chipText}>
                                                Attending
                                            </Chip>
                                        )}
                                        {isFull && !isAttending && (
                                            <Chip style={styles.fullChip} textStyle={styles.chipText}>
                                                Full
                                            </Chip>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Card.Content>
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
                            style={[styles.filterChip, filter === 'upcoming' && styles.filterChipActive]}
                            onPress={() => setFilter('upcoming')}
                        >
                            <Text style={[styles.filterText, filter === 'upcoming' && styles.filterTextActive]}>
                                Upcoming
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.filterChip, filter === 'past' && styles.filterChipActive]}
                            onPress={() => setFilter('past')}
                        >
                            <Text style={[styles.filterText, filter === 'past' && styles.filterTextActive]}>
                                Past
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.filterChip, filter === 'myEvents' && styles.filterChipActive]}
                            onPress={() => setFilter('myEvents')}
                        >
                            <Text style={[styles.filterText, filter === 'myEvents' && styles.filterTextActive]}>
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
                            title={filter === 'myEvents' ? "No events yet" : "No upcoming events"}
                            message={filter === 'myEvents' 
                                ? "Events you create or join will appear here" 
                                : "Check back later or create your own event!"}
                            action={
                                <TouchableOpacity style={styles.createButton} onPress={handleCreateEvent}>
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

export default React.memo(EventsScreen);