import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../store/AuthContext';
import { colors } from '../../constants/theme';
import { format } from 'date-fns';

const DashboardScreen = ({ navigation }) => {
    const { user } = useAuth();
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

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        // Simulate data refresh
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    const renderPinnedModule = (moduleId) => {
        const moduleConfigs = {
            autonomo_checklist: {
                title: 'Autónomo Checklist',
                subtitle: '0/5 steps completed',
                icon: 'clipboard-check',
                onPress: () => navigation.navigate('Checklist'),
            },
            tax_guides: {
                title: 'Tax Guides',
                subtitle: 'IVA & IRPF explained',
                icon: 'calculator',
                onPress: () => navigation.navigate('Resources'),
            },
            coworking_finder: {
                title: 'Coworking Finder',
                subtitle: 'Top-rated spaces',
                icon: 'office-building',
                onPress: () => navigation.navigate('Resources'),
            },
            company_formation: {
                title: "Founder's Checklist",
                subtitle: '0/4 steps completed',
                icon: 'domain',
                onPress: () => navigation.navigate('Checklist'),
            },
            funding_guide: {
                title: 'Funding & Grants',
                subtitle: 'ENISA, ICO, and more',
                icon: 'cash',
                onPress: () => navigation.navigate('Resources'),
            },
        };

        const config = moduleConfigs[moduleId];
        if (!config) return null;

        return (
            <TouchableOpacity
                key={moduleId}
                style={styles.pinnedCard}
                onPress={config.onPress}
                activeOpacity={0.8}
            >
                <View style={styles.pinnedCardIcon}>
                    <Icon name={config.icon} size={24} color={colors.primary} />
                </View>
                <View style={styles.pinnedCardContent}>
                    <Text style={styles.pinnedCardTitle}>{config.title}</Text>
                    <Text style={styles.pinnedCardSubtitle}>{config.subtitle}</Text>
                </View>
                <Icon name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
        );
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.header}>
                <Text style={styles.greeting}>Hello, {user?.name}!</Text>
                <Text style={styles.subGreeting}>
                    {user?.professionalPath === 'FREELANCER'
                        ? 'Your freelance journey in Alicante'
                        : 'Building your startup in Alicante'}
                </Text>
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
                        <Card.Content>
                            <View style={styles.eventHeader}>
                                <View style={styles.eventInfo}>
                                    <Text style={styles.eventTitle}>{event.title}</Text>
                                    <Text style={styles.eventDate}>
                                        {format(event.date, 'EEEE, MMM d · h:mm a')}
                                    </Text>
                                    <Text style={styles.eventLocation}>
                                        <Icon name="map-marker" size={14} color={colors.textSecondary} />
                                        {' '}{event.location}
                                    </Text>
                                </View>
                                <View style={styles.eventAttendees}>
                                    <Icon name="account-group" size={20} color={colors.primary} />
                                    <Text style={styles.attendeesText}>{event.attendees}</Text>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>
                ))}
            </View>

            <View style={styles.quickActions}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionGrid}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('Budget')}
                    >
                        <Icon name="currency-eur" size={28} color={colors.primary} />
                        <Text style={styles.actionText}>Add Income</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('Budget')}
                    >
                        <Icon name="receipt" size={28} color={colors.primary} />
                        <Text style={styles.actionText}>Log Expense</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('Resources')}
                    >
                        <Icon name="book-open-variant" size={28} color={colors.primary} />
                        <Text style={styles.actionText}>Browse Guides</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('Resources')}
                    >
                        <Icon name="phone" size={28} color={colors.primary} />
                        <Text style={styles.actionText}>Find Services</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    header: {
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 30,
    },
    greeting: {
        fontSize: 28,
        fontFamily: 'Poppins-Bold',
        color: 'white',
        marginBottom: 4,
    },
    subGreeting: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: 'white',
        opacity: 0.9,
    },
    section: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold',
        color: colors.text,
        marginBottom: 16,
    },
    pinnedModules: {
        marginBottom: 8,
    },
    pinnedCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    pinnedCardIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    pinnedCardContent: {
        flex: 1,
    },
    pinnedCardTitle: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: colors.text,
        marginBottom: 2,
    },
    pinnedCardSubtitle: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: colors.textSecondary,
    },
    eventCard: {
        marginBottom: 12,
        borderRadius: 12,
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    eventInfo: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: colors.text,
        marginBottom: 4,
    },
    eventDate: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: colors.textSecondary,
        marginBottom: 2,
    },
    eventLocation: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: colors.textSecondary,
    },
    eventAttendees: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    attendeesText: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        color: colors.primary,
        marginLeft: 4,
    },
    quickActions: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    actionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    actionButton: {
        width: '50%',
        paddingHorizontal: 6,
        marginBottom: 12,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        margin: 6,
        flex: 1,
        minWidth: '45%',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    actionText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: colors.text,
        marginTop: 8,
    },
});

export default DashboardScreen;