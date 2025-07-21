import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, borderRadius, shadows, fonts } from '../../../constants/theme';

export const forumsStyles = (theme) => {
    const safeTheme = {
        colors: {
            background: '#F3F4F6',
            surface: '#FFFFFF',
            text: '#111827',
            textSecondary: '#6B7280',
            primary: '#1E3A8A',
            border: '#E5E7EB',
            error: '#EF4444',
            ...theme?.colors
        },
        spacing: {
            xs: 4,
            sm: 8,
            md: 16,
            lg: 20,
            xl: 30,
            ...theme?.spacing
        }
    };

    return StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: safeTheme.colors.background,
        },
        container: {
            flex: 1,
            backgroundColor: safeTheme.colors.background,
        },
        header: {
            paddingHorizontal: safeTheme.spacing.md,
            paddingVertical: safeTheme.spacing.lg,
            backgroundColor: safeTheme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: safeTheme.colors.border,
        },
        headerTitle: {
            fontSize: 28,
            fontWeight: 'bold',
            color: safeTheme.colors.text,
            marginBottom: safeTheme.spacing.xs,
        },
        headerSubtitle: {
            fontSize: 16,
            color: safeTheme.colors.textSecondary,
        },
        listContent: {
            paddingBottom: safeTheme.spacing.xl + 60, // Extra padding for FAB
        },
        forumCard: {
            marginHorizontal: safeTheme.spacing.md,
            marginVertical: safeTheme.spacing.xs,
            backgroundColor: safeTheme.colors.surface,
            borderRadius: borderRadius.md,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },
        forumHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        forumInfo: {
            flex: 1,
            marginRight: safeTheme.spacing.md,
        },
        titleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: safeTheme.spacing.xs,
        },
        forumTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: safeTheme.colors.text,
            flex: 1,
            marginRight: safeTheme.spacing.sm,
        },
        unreadBadge: {
            backgroundColor: safeTheme.colors.primary,
            minWidth: 20,
            height: 20,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 6,
        },
        unreadBadgeText: {
            color: '#FFFFFF',
            fontSize: 11,
            fontWeight: 'bold',
        },
        lastMessage: {
            fontSize: 14,
            color: safeTheme.colors.textSecondary,
            marginBottom: safeTheme.spacing.xs,
        },
        lastMessageSender: {
            fontWeight: '600',
            color: safeTheme.colors.text,
        },
        forumDescription: {
            fontSize: 14,
            color: safeTheme.colors.textSecondary,
            marginBottom: safeTheme.spacing.xs,
        },
        forumMeta: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        lastMessageTime: {
            fontSize: 12,
            color: safeTheme.colors.textSecondary,
        },
        metaItem: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        metaText: {
            fontSize: 12,
            color: safeTheme.colors.textSecondary,
            marginLeft: 4,
        },
        fab: {
            position: 'absolute',
            right: safeTheme.spacing.md,
            bottom: safeTheme.spacing.md,
            backgroundColor: safeTheme.colors.primary,
            elevation: 6,
        },
        modal: {
            backgroundColor: safeTheme.colors.surface,
            marginHorizontal: safeTheme.spacing.lg,
            borderRadius: borderRadius.lg,
            padding: safeTheme.spacing.lg,
            maxHeight: '80%',
            ...Platform.select({
                ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                },
                android: {
                    elevation: 8,
                },
            }),
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: safeTheme.colors.text,
            marginBottom: safeTheme.spacing.lg,
            textAlign: 'center',
        },
        input: {
            marginBottom: safeTheme.spacing.md,
            backgroundColor: safeTheme.colors.surface,
        },
        errorText: {
            fontSize: 12,
            color: safeTheme.colors.error,
            marginTop: -safeTheme.spacing.sm,
            marginBottom: safeTheme.spacing.md,
            marginLeft: safeTheme.spacing.xs,
        },
        modalButtons: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: safeTheme.spacing.md,
            marginTop: safeTheme.spacing.lg,
        },
        modalButton: {
            flex: 1,
        },
    });
};