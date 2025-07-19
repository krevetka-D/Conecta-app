// frontend/src/styles/screens/events/EventsScreenStyles.js

import { StyleSheet } from 'react-native';

export const eventsStyles = (theme) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        padding: theme.spacing.m,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.backdrop,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.m,
    },
    filterContainer: {
        flexDirection: 'row',
        gap: theme.spacing.s,
    },
    filterChip: {
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.roundness * 2,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.backdrop,
    },
    filterChipActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    filterText: {
        fontSize: 14,
        color: theme.colors.text,
    },
    filterTextActive: {
        color: theme.colors.onPrimary,
        fontWeight: 'bold',
    },
    listContent: {
        padding: theme.spacing.m,
    },
    eventCard: {
        marginBottom: theme.spacing.m,
        backgroundColor: theme.colors.card,
        borderRadius: theme.roundness,
    },
    eventHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    eventDateBadge: {
        width: 60,
        height: 60,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.roundness,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.m,
    },
    eventDateDay: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.onPrimary,
    },
    eventDateMonth: {
        fontSize: 12,
        color: theme.colors.onPrimary,
        textTransform: 'uppercase',
    },
    eventInfo: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    eventMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.s,
    },
    eventTime: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginLeft: theme.spacing.xs,
        marginRight: theme.spacing.m,
    },
    metaIcon: {
        marginLeft: theme.spacing.s,
    },
    eventLocation: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginLeft: theme.spacing.xs,
        flex: 1,
    },
    eventFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: theme.spacing.s,
    },
    attendeesPreview: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    attendeesCount: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginLeft: theme.spacing.xs,
    },
    eventTags: {
        flexDirection: 'row',
        gap: theme.spacing.xs,
    },
    attendingChip: {
        height: 24,
        backgroundColor: theme.colors.primary,
    },
    fullChip: {
        height: 24,
        backgroundColor: theme.colors.error,
    },
    chipText: {
        fontSize: 12,
        color: theme.colors.onPrimary,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.primary,
    },
    createButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.l,
        paddingVertical: theme.spacing.m,
        borderRadius: theme.roundness * 3,
        marginTop: theme.spacing.m,
    },
    createButtonText: {
        color: theme.colors.onPrimary,
        fontWeight: 'bold',
        fontSize: 16,
    },
});