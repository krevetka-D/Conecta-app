// frontend/src/styles/screens/main/DashboardScreenStyles.js

import { StyleSheet } from 'react-native';

/**
 * This file must export a FUNCTION that accepts the theme.
 * This prevents the theme from being accessed before it's available.
 */
export const dashboardStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollView: {
        padding: theme.spacing.m,
    },
    header: {
        marginBottom: theme.spacing.l,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    welcomeSubtext: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.m,
    },
    quickActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: theme.spacing.l,
    },
    actionButton: {
        alignItems: 'center',
    },
    actionIconContainer: {
        backgroundColor: theme.colors.primary,
        borderRadius: 30,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.s,
    },
    actionText: {
        color: theme.colors.text,
        textAlign: 'center',
    },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.roundness,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.l,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    cardContent: {
        marginTop: theme.spacing.m,
    },
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.xl,
    },
    emptyStateText: {
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.m,
    },
});
