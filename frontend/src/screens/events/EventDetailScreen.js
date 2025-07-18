// frontend/src/screens/events/EventDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { Card, Button, Chip, Avatar, Menu, Divider } from 'react-native-paper';
import Icon from '../../components/common/Icon.js';
import { format } from 'date-fns';

import { useAuth } from '../../store/contexts/AuthContext';
import { useTheme } from '../../store/contexts/ThemeContext';
import eventService from '../../services/eventService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { showErrorAlert, showSuccessAlert, showConfirmAlert } from '../../utils/alerts';
import { eventDetailStyles } from '../../styles/screens/events/EventDetailScreenStyles';

const EventDetailScreen = ({ route, navigation }) => {
    const theme = useTheme();
    const styles = eventDetailStyles(theme);
    const { user } = useAuth();
    const { eventId } = route.params;

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);

    useEffect(() => {
        loadEventDetail();
    }, [eventId]);

    const loadEventDetail = async () => {
        try {
            const data = await eventService.getEvent(eventId);
            setEvent(data);
        } catch (error) {
            console.error('Failed to load event:', error);
            showErrorAlert('Error', 'Failed to load event details');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinEvent = async () => {
        setActionLoading(true);
        try {
            await eventService.joinEvent(eventId);
            showSuccessAlert('Success', 'You have joined the event!');
            loadEventDetail();
        } catch (error) {
            showErrorAlert('Error', error.message || 'Failed to join event');
        } finally {
            setActionLoading(false);
        }
    };

    const handleLeaveEvent = async () => {
        setActionLoading(true);
        try {
            await eventService.leaveEvent(eventId);
            showSuccessAlert('Success', 'You have left the event');
            loadEventDetail();
        } catch (error) {
            showErrorAlert('Error', error.message || 'Failed to leave event');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteEvent = async () => {
        showConfirmAlert(
            'Delete Event',
            'Are you sure you want to delete this event? This action cannot be undone.',
            async () => {
                setActionLoading(true);
                try {
                    await eventService.deleteEvent(eventId);
                    showSuccessAlert('Success', 'Event deleted successfully');
                    navigation.goBack();
                } catch (error) {
                    showErrorAlert('Error', error.message || 'Failed to delete event');
                } finally {
                    setActionLoading(false);
                }
            }
        );
    };

    if (loading) {
        return <LoadingSpinner fullScreen text="Loading event..." />;
    }

    if (!event) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Event not found</Text>
            </View>
        );
    }

    const isOrganizer = event.organizer?._id === user?._id;
    const isAttending = event.attendees?.some(att => att._id === user?._id);
    const isFull = event.maxAttendees && event.attendees?.length >= event.maxAttendees;
    const eventDate = new Date(event.date);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <Card style={styles.headerCard}>
                    <Card.Content>
                        <View style={styles.dateContainer}>
                            <View style={styles.dateBadge}>
                                <Text style={styles.dateDay}>{format(eventDate, 'dd')}</Text>
                                <Text style={styles.dateMonth}>{format(eventDate, 'MMM')}</Text>
                            </View>
                            <View style={styles.headerInfo}>
                                <Text style={styles.title}>{event.title}</Text>
                                <View style={styles.metaContainer}>
                                    <Icon name="clock-outline" size={16} color={theme.colors.textSecondary} />
                                    <Text style={styles.metaText}>{event.time}</Text>
                                </View>
                            </View>
                            {isOrganizer && (
                                <Menu
                                    visible={menuVisible}
                                    onDismiss={() => setMenuVisible(false)}
                                    anchor={
                                        <TouchableOpacity
                                            onPress={() => setMenuVisible(true)}
                                            style={styles.menuButton}
                                        >
                                            <Icon name="dots-vertical" size={24} color={theme.colors.text} />
                                        </TouchableOpacity>
                                    }
                                >
                                    <Menu.Item
                                        onPress={() => {
                                            setMenuVisible(false);
                                            navigation.navigate('EditEvent', { eventId, event });
                                        }}
                                        title="Edit Event"
                                        leadingIcon="pencil"
                                    />
                                    <Divider />
                                    <Menu.Item
                                        onPress={() => {
                                            setMenuVisible(false);
                                            handleDeleteEvent();
                                        }}
                                        title="Delete Event"
                                        leadingIcon="delete"
                                        titleStyle={{ color: theme.colors.error }}
                                    />
                                </Menu>
                            )}
                        </View>
                    </Card.Content>
                </Card>

                <Card style={styles.infoCard}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>About this event</Text>
                        <Text style={styles.description}>{event.description}</Text>
                    </Card.Content>
                </Card>

                <Card style={styles.infoCard}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Location</Text>
                        <View style={styles.locationContainer}>
                            <Icon name="map-marker" size={20} color={theme.colors.primary} />
                            <View style={styles.locationInfo}>
                                <Text style={styles.locationName}>{event.location.name}</Text>
                                {event.location.address && (
                                    <Text style={styles.locationAddress}>{event.location.address}</Text>
                                )}
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                <Card style={styles.infoCard}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>
                            Attendees ({event.attendees?.length || 0}
                            {event.maxAttendees && `/${event.maxAttendees}`})
                        </Text>
                        <View style={styles.attendeesList}>
                            {event.attendees?.slice(0, 5).map((attendee, index) => (
                                <View key={attendee._id} style={styles.attendeeChip}>
                                    <Avatar.Text size={32} label={attendee.name.charAt(0)} />
                                    <Text style={styles.attendeeName}>{attendee.name}</Text>
                                </View>
                            ))}
                            {event.attendees?.length > 5 && (
                                <Text style={styles.moreAttendees}>
                                    +{event.attendees.length - 5} more
                                </Text>
                            )}
                        </View>
                    </Card.Content>
                </Card>

                <View style={styles.actionContainer}>
                    {isOrganizer ? (
                        <Button
                            mode="contained"
                            style={styles.actionButton}
                            disabled
                        >
                            You're the organizer
                        </Button>
                    ) : isAttending ? (
                        <Button
                            mode="outlined"
                            style={styles.actionButton}
                            onPress={handleLeaveEvent}
                            loading={actionLoading}
                            disabled={actionLoading}
                        >
                            Leave Event
                        </Button>
                    ) : (
                        <Button
                            mode="contained"
                            style={styles.actionButton}
                            onPress={handleJoinEvent}
                            loading={actionLoading}
                            disabled={actionLoading || isFull}
                        >
                            {isFull ? 'Event Full' : 'Join Event'}
                        </Button>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default React.memo(EventDetailScreen);