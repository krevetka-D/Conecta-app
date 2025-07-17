// frontend/src/screens/events/EventDetailScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Share,
    Alert,
} from 'react-native';
import { Card, Avatar, Chip, Button as PaperButton, Menu, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';

import { useAuth } from '../../store/contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/theme';
import eventService from '../../services/eventService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { showErrorAlert, showSuccessAlert, showConfirmAlert } from '../../utils/alerts';
import { eventDetailStyles as styles } from '../../styles/screens/events/EventDetailScreenStyles';

const EventDetailScreen = ({ route, navigation }) => {
    const { eventId } = route.params;
    const { user } = useAuth();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);

    useEffect(() => {
        loadEvent();
    }, [eventId]);

    const loadEvent = async () => {
        try {
            setLoading(true);
            const data = await eventService.getEvent(eventId);
            setEvent(data);
            
            // Update navigation header with event title
            navigation.setOptions({
                title: data.title,
                headerRight: () => data.isCreator ? (
                    <Menu
                        visible={menuVisible}
                        onDismiss={() => setMenuVisible(false)}
                        anchor={
                            <TouchableOpacity onPress={() => setMenuVisible(true)}>
                                <Icon name="dots-vertical" size={24} color={colors.text} />
                            </TouchableOpacity>
                        }
                    >
                        <Menu.Item onPress={handleEdit} title="Edit Event" />
                        <Menu.Item onPress={handleDelete} title="Cancel Event" />
                    </Menu>
                ) : null,
            });
        } catch (error) {
            console.error('Failed to load event:', error);
            showErrorAlert('Error', 'Failed to load event details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleJoinEvent = async () => {
        setActionLoading(true);
        try {
            await eventService.joinEvent(eventId);
            showSuccessAlert('Success', 'You have successfully joined the event!');
            loadEvent(); // Reload to update attendee list
        } catch (error) {
            showErrorAlert('Error', error.message || 'Failed to join event');
        } finally {
            setActionLoading(false);
        }
    };

    const handleLeaveEvent = async () => {
        showConfirmAlert(
            'Leave Event',
            'Are you sure you want to leave this event?',
            async () => {
                setActionLoading(true);
                try {
                    await eventService.leaveEvent(eventId);
                    showSuccessAlert('Success', 'You have left the event');
                    loadEvent(); // Reload to update attendee list
                } catch (error) {
                    showErrorAlert('Error', error.message || 'Failed to leave event');
                } finally {
                    setActionLoading(false);
                }
            }
        );
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this event: ${event.title}\n\nDate: ${format(new Date(event.eventDate), 'MMMM dd, yyyy')}\nTime: ${event.eventTime}\nLocation: ${event.location}\n\nJoin me at this event in Alicante!`,
                title: event.title,
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const handleEdit = () => {
        setMenuVisible(false);
        navigation.navigate('EditEvent', { eventId: event._id });
    };

    const handleDelete = () => {
        setMenuVisible(false);
        showConfirmAlert(
            'Cancel Event',
            'Are you sure you want to cancel this event? This will notify all attendees.',
            async () => {
                try {
                    await eventService.deleteEvent(eventId);
                    showSuccessAlert('Success', 'Event has been cancelled');
                    navigation.goBack();
                } catch (error) {
                    showErrorAlert('Error', 'Failed to cancel event');
                }
            }
        );
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!event) {
        return null;
    }

    const eventDate = new Date(event.eventDate);
    const isPastEvent = eventDate < new Date();
    const canJoin = !event.isAttending && !event.isFull && !isPastEvent;
    const canLeave = event.isAttending && !event.isCreator && !isPastEvent;

    const getCategoryIcon = (category) => {
        const icons = {
            NETWORKING: 'account-group',
            WORKSHOP: 'school',
            SOCIAL: 'party-popper',
            MEETUP: 'coffee',
            CONFERENCE: 'presentation',
            OTHER: 'calendar',
        };
        return icons[category] || 'calendar';
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.dateCard}>
                        <Text style={styles.dateDay}>{format(eventDate, 'dd')}</Text>
                        <Text style={styles.dateMonth}>{format(eventDate, 'MMM')}</Text>
                        <Text style={styles.dateYear}>{format(eventDate, 'yyyy')}</Text>
                    </View>
                    
                    <View style={styles.headerInfo}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        <View style={styles.categoryRow}>
                            <Icon 
                                name={getCategoryIcon(event.category)} 
                                size={20} 
                                color={colors.primary} 
                            />
                            <Text style={styles.categoryText}>{event.category}</Text>
                            {event.targetAudience !== 'BOTH' && (
                                <Chip style={styles.audienceChip}>
                                    {event.targetAudience === 'FREELANCER' ? 'Freelancers' : 'Entrepreneurs'}
                                </Chip>
                            )}
                        </View>
                    </View>
                </View>

                <Card style={styles.infoCard}>
                    <Card.Content>
                        <View style={styles.infoRow}>
                            <Icon name="clock-outline" size={20} color={colors.textSecondary} />
                            <Text style={styles.infoText}>{event.eventTime}</Text>
                        </View>
                        <Divider style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Icon name="map-marker-outline" size={20} color={colors.textSecondary} />
                            <Text style={styles.infoText}>{event.location}</Text>
                        </View>
                        <Divider style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Icon name="account-outline" size={20} color={colors.textSecondary} />
                            <Text style={styles.infoText}>
                                Hosted by {event.creator.name}
                            </Text>
                        </View>
                    </Card.Content>
                </Card>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.description}>{event.description}</Text>
                    
                    {event.tags && event.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            {event.tags.map((tag, index) => (
                                <Chip key={index} style={styles.tag}>
                                    #{tag}
                                </Chip>
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <View style={styles.attendeesHeader}>
                        <Text style={styles.sectionTitle}>
                            Attendees ({event.attendeeCount}
                            {event.maxAttendees && ` / ${event.maxAttendees}`})
                        </Text>
                        {event.isFull && (
                            <Chip style={styles.fullBadge} textStyle={styles.fullBadgeText}>
                                Event Full
                            </Chip>
                        )}
                    </View>
                    
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.attendeesList}>
                            {event.attendees.slice(0, 10).map((attendee, index) => (
                                <View key={attendee.user._id} style={styles.attendeeItem}>
                                    <Avatar.Text 
                                        size={40} 
                                        label={attendee.user.name.charAt(0).toUpperCase()}
                                        style={styles.attendeeAvatar}
                                    />
                                    <Text style={styles.attendeeName} numberOfLines={1}>
                                        {attendee.user.name.split(' ')[0]}
                                    </Text>
                                </View>
                            ))}
                            {event.attendeeCount > 10 && (
                                <View style={styles.attendeeItem}>
                                    <View style={styles.moreAttendeesCircle}>
                                        <Text style={styles.moreAttendeesText}>
                                            +{event.attendeeCount - 10}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                </View>

                <View style={styles.actionsContainer}>
                    {canJoin && (
                        <Button
                            title="Join Event"
                            onPress={handleJoinEvent}
                            loading={actionLoading}
                            disabled={actionLoading}
                            fullWidth
                            style={styles.primaryButton}
                        />
                    )}
                    
                    {canLeave && (
                        <Button
                            title="Leave Event"
                            onPress={handleLeaveEvent}
                            loading={actionLoading}
                            disabled={actionLoading}
                            variant="outline"
                            fullWidth
                            style={styles.outlineButton}
                        />
                    )}
                    
                    {event.isAttending && (
                        <View style={styles.attendingBadge}>
                            <Icon name="check-circle" size={20} color={colors.success} />
                            <Text style={styles.attendingText}>You're attending this event</Text>
                        </View>
                    )}
                    
                    {isPastEvent && (
                        <View style={styles.pastEventBadge}>
                            <Icon name="clock-alert-outline" size={20} color={colors.textSecondary} />
                            <Text style={styles.pastEventText}>This event has ended</Text>
                        </View>
                    )}
                    
                    <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                        <Icon name="share-variant" size={20} color={colors.primary} />
                        <Text style={styles.shareButtonText}>Share Event</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EventDetailScreen;