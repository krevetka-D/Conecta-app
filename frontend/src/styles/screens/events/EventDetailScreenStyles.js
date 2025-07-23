// frontend/src/styles/screens/events/EventDetailScreenStyles.js
import { StyleSheet } from 'react-native';

export const eventDetailStyles = (theme) =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        errorContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.xl,
        },
        errorText: {
            fontSize: 16,
            color: theme.colors.textSecondary,
        },
        headerCard: {
            margin: theme.spacing.m,
            backgroundColor: theme.colors.primary,
        },
        dateContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        dateBadge: {
            width: 70,
            height: 70,
            backgroundColor: theme.colors.background,
            borderRadius: theme.roundness,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.spacing.m,
        },
        dateDay: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.colors.primary,
        },
        dateMonth: {
            fontSize: 14,
            color: theme.colors.primary,
            textTransform: 'uppercase',
        },
        headerInfo: {
            flex: 1,
        },
        title: {
            fontSize: 22,
            fontWeight: 'bold',
            color: theme.colors.onPrimary,
            marginBottom: theme.spacing.s,
        },
        metaContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        metaText: {
            fontSize: 16,
            color: theme.colors.onPrimary,
            marginLeft: theme.spacing.xs,
        },
        infoCard: {
            margin: theme.spacing.m,
            marginTop: 0,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginBottom: theme.spacing.m,
        },
        description: {
            fontSize: 16,
            color: theme.colors.text,
            lineHeight: 24,
        },
        locationContainer: {
            flexDirection: 'row',
            alignItems: 'flex-start',
        },
        locationInfo: {
            flex: 1,
            marginLeft: theme.spacing.m,
        },
        locationName: {
            fontSize: 16,
            fontWeight: 'bold',
            color: theme.colors.text,
        },
        locationAddress: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.xs,
        },
        attendeesList: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.s,
        },
        attendeeChip: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.background,
            padding: theme.spacing.s,
            borderRadius: theme.roundness * 3,
        },
        attendeeName: {
            marginLeft: theme.spacing.s,
            marginRight: theme.spacing.s,
            fontSize: 14,
            color: theme.colors.text,
        },
        moreAttendees: {
            alignSelf: 'center',
            marginLeft: theme.spacing.m,
            fontSize: 14,
            color: theme.colors.textSecondary,
            fontStyle: 'italic',
        },
        actionContainer: {
            padding: theme.spacing.m,
            paddingBottom: theme.spacing.xl,
        },
        actionButton: {
            paddingVertical: theme.spacing.s,
        },
        menuButton: {
            position: 'absolute',
            top: 0,
            right: 0,
            padding: 8,
        },
    });
