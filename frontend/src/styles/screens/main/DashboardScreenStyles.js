// frontend/src/styles/screens/main/DashboardScreenStyles.js

import { StyleSheet } from 'react-native';

export const dashboardStyles = (theme) => {
    const safeTheme = {
        colors: {
            background: '#F3F4F6',
            surface: '#FFFFFF',
            text: '#111827',
            textSecondary: '#6B7280',
            primary: '#1E3A8A',
            success: '#10B981',
            error: '#EF4444',
            border: '#E5E7EB',
            shadow: '#000000',
            ...theme?.colors
        },
        spacing: {
            xs: 4,
            s: 8,
            m: 16,
            l: 20,
            xl: 30,
            ...theme?.spacing
        },
        fonts: {
            regular: 'System',
            medium: 'System',
            bold: 'System',
            ...theme?.fonts
        },
        roundness: theme?.roundness || 8,
    };

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: safeTheme.colors.background,
        },
        scrollView: {
            padding: safeTheme.spacing.m,
        },
        headerSection: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 10,
        },
        profileButton: {
            position: 'relative',
        },
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
            backgroundColor: safeTheme.colors.surface,
            borderRadius: 12,
        },
        statContent: {
            alignItems: 'center',
            paddingVertical: 20,
        },
        statNumber: {
            fontSize: 24,
            fontWeight: 'bold',
            color: safeTheme.colors.text,
            marginTop: 8,
        },
        statLabel: {
            fontSize: 12,
            color: safeTheme.colors.textSecondary,
            marginTop: 4,
            textAlign: 'center',
        },
        sectionCard: {
            margin: 15,
            marginTop: 10,
            elevation: 3,
            backgroundColor: safeTheme.colors.surface,
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
            color: safeTheme.colors.text,
        },
        viewAllButton: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        viewAllText: {
            fontSize: 14,
            color: safeTheme.colors.primary,
            marginRight: 4,
        },
        eventsList: {
            paddingVertical: 10,
        },
        eventCard: {
            backgroundColor: safeTheme.colors.background,
            borderRadius: 12,
            padding: 15,
            marginRight: 12,
            width: 280,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: safeTheme.colors.border,
        },
        eventDateBadge: {
            backgroundColor: safeTheme.colors.primary,
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
        },
        eventDateMonth: {
            fontSize: 12,
            color: '#FFFFFF',
            textTransform: 'uppercase',
        },
        eventInfo: {
            flex: 1,
        },
        eventTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: safeTheme.colors.text,
            marginBottom: 6,
        },
        eventMeta: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 4,
        },
        eventTime: {
            fontSize: 13,
            color: safeTheme.colors.textSecondary,
            marginLeft: 4,
        },
        eventLocation: {
            fontSize: 13,
            color: safeTheme.colors.textSecondary,
            marginLeft: 4,
            flex: 1,
        },
        eventAttendees: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 4,
        },
        eventAttendeesText: {
            fontSize: 12,
            color: safeTheme.colors.textSecondary,
            marginLeft: 4,
        },
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
            color: safeTheme.colors.textSecondary,
            marginTop: 8,
            textAlign: 'center',
        },
        emptyState: {
            paddingVertical: 30,
            alignItems: 'center',
        },
        emptyStateText: {
            fontSize: 14,
            color: safeTheme.colors.textSecondary,
            marginTop: 10,
        },
        emptyStateButton: {
            marginTop: 15,
            paddingHorizontal: 20,
            paddingVertical: 8,
            backgroundColor: safeTheme.colors.primary,
            borderRadius: 20,
        },
        emptyStateButtonText: {
            fontSize: 14,
            color: '#FFFFFF',
        },
        budgetSummary: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingVertical: 10,
        },
        budgetItem: {
            alignItems: 'center',
        },
        budgetLabel: {
            fontSize: 14,
            color: safeTheme.colors.textSecondary,
            marginBottom: 4,
        },
        budgetAmount: {
            fontSize: 18,
            fontWeight: 'bold',
        },
        incomeAmount: {
            color: safeTheme.colors.success,
        },
        expenseAmount: {
            color: safeTheme.colors.error,
        },
        budgetDivider: {
            width: 1,
            backgroundColor: safeTheme.colors.border,
            marginHorizontal: 20,
        },
        // Additional styles for consistency
        welcomeText: {
            fontSize: 24,
            fontWeight: 'bold',
            color: safeTheme.colors.text,
        },
        welcomeSubtext: {
            fontSize: 16,
            color: safeTheme.colors.textSecondary,
            marginTop: safeTheme.spacing.xs,
        },
        card: {
            backgroundColor: safeTheme.colors.card || safeTheme.colors.surface,
            borderRadius: safeTheme.roundness,
            padding: safeTheme.spacing.m,
            marginBottom: safeTheme.spacing.l,
        },
        cardTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: safeTheme.colors.text,
        },
        cardContent: {
            marginTop: safeTheme.spacing.m,
        },
        header: {
            marginBottom: safeTheme.spacing.l,
        },
        quickActionsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginBottom: safeTheme.spacing.l,
        },
        actionButton: {
            alignItems: 'center',
        },
        actionIconContainer: {
            backgroundColor: safeTheme.colors.primary,
            borderRadius: 30,
            width: 60,
            height: 60,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: safeTheme.spacing.s,
        },
        actionText: {
            color: safeTheme.colors.text,
            textAlign: 'center',
        },
        emptyStateContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: safeTheme.spacing.xl,
        },
    });
};