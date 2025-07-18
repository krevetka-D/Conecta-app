// frontend/src/styles/screens/dashboard/EnhancedDashboardStyles.js
import { StyleSheet, Platform } from 'react-native';

export const enhancedDashboardStyles = (theme) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    
    // Welcome Section
    welcomeSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    welcomeText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        fontFamily: theme.fonts.regular,
    },
    userName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.text,
        fontFamily: theme.fonts.bold,
        marginTop: 4,
    },
    profileButton: {
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: theme.colors.error,
    },
    
    // Stats Cards
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 15,
        paddingVertical: 10,
        justifyContent: 'space-between',
    },
    statCard: {
        width: '48%',
        marginBottom: 15,
        elevation: 2,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
    },
    statContent: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginTop: 8,
        fontFamily: theme.fonts.bold,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 4,
        textAlign: 'center',
        fontFamily: theme.fonts.regular,
    },
    
    // Section Cards
    sectionCard: {
        margin: 15,
        marginTop: 10,
        elevation: 3,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        fontFamily: theme.fonts.medium,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewAllText: {
        fontSize: 14,
        color: theme.colors.primary,
        marginRight: 4,
        fontFamily: theme.fonts.regular,
    },
    
    // Upcoming Events
    eventsList: {
        paddingVertical: 10,
    },
    eventCard: {
        backgroundColor: theme.colors.background,
        borderRadius: 12,
        padding: 15,
        marginRight: 12,
        width: 280,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    eventDateBadge: {
        backgroundColor: theme.colors.primary,
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        marginRight: 15,
        minWidth: 50,
    },
    eventDateDay: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: theme.fonts.bold,
    },
    eventDateMonth: {
        fontSize: 12,
        color: '#FFFFFF',
        textTransform: 'uppercase',
        fontFamily: theme.fonts.regular,
    },
    eventInfo: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 6,
        fontFamily: theme.fonts.medium,
    },
    eventMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    eventTime: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginLeft: 4,
        fontFamily: theme.fonts.regular,
    },
    eventLocation: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginLeft: 4,
        flex: 1,
        fontFamily: theme.fonts.regular,
    },
    eventAttendees: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    eventAttendeesText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginLeft: 4,
        fontFamily: theme.fonts.regular,
    },
    
    // Forum Activity
    forumList: {
        paddingTop: 10,
    },
    forumCard: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    forumContent: {
        flex: 1,
        marginLeft: 12,
    },
    forumAuthor: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text,
        fontFamily: theme.fonts.medium,
    },
    forumAction: {
        fontSize: 13,
        color: theme.colors.primary,
        marginTop: 2,
        fontFamily: theme.fonts.regular,
    },
    forumPreview: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 4,
        lineHeight: 20,
        fontFamily: theme.fonts.regular,
    },
    forumTime: {
        fontSize: 12,
        color: theme.colors.textTertiary,
        marginTop: 4,
        fontFamily: theme.fonts.regular,
    },
    
    // Quick Actions
    quickActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 15,
        marginHorizontal: -5,
    },
    quickActionButton: {
        width: '25%',
        paddingVertical: 15,
        alignItems: 'center',
    },
    quickActionText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 8,
        textAlign: 'center',
        fontFamily: theme.fonts.regular,
    },
    
    // Empty States
    emptyState: {
        paddingVertical: 30,
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 10,
        fontFamily: theme.fonts.regular,
    },
    emptyStateButton: {
        marginTop: 15,
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: theme.colors.primary,
        borderRadius: 20,
    },
    emptyStateButtonText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontFamily: theme.fonts.medium,
    },
    
    // FAB
    fab: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        marginBottom: Platform.OS === 'ios' ? 20 : 0,
    },
});