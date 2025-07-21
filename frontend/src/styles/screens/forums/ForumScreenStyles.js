
import { StyleSheet } from 'react-native';
import { colors, fonts, spacing, borderRadius, shadows } from '../../../constants/theme';

export const forumsStyles = (theme) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme?.colors?.background || colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: theme?.colors?.background || colors.background,
    },
    header: {
        padding: spacing.lg,
        backgroundColor: theme?.colors?.surface || colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme?.colors?.border || colors.border,
    },
    headerTitle: {
        fontSize: fonts.sizes.xxl,
        fontWeight: 'bold',
        color: theme?.colors?.text || colors.text,
        marginBottom: spacing.xs,
    },
    headerSubtitle: {
        fontSize: fonts.sizes.md,
        color: theme?.colors?.textSecondary || colors.textSecondary,
    },
    listContent: {
        padding: spacing.md,
    },
    forumCard: {
        marginBottom: spacing.md,
        backgroundColor: theme?.colors?.surface || colors.surface,
        borderRadius: borderRadius.lg,
        elevation: 2,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    forumCardContent: {
        // Remove overflow from Card content
    },
    forumHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    forumInfo: {
        flex: 1,
        marginRight: spacing.sm,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    forumTitle: {
        fontSize: fonts.sizes.lg,
        fontWeight: '600',
        color: theme?.colors?.text || colors.text,
        flex: 1,
    },
    unreadBadge: {
        backgroundColor: theme?.colors?.primary || colors.primary,
        marginLeft: spacing.sm,
        minWidth: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xs,
    },
    unreadBadgeText: {
        color: colors.textInverse,
        fontSize: fonts.sizes.xs,
        fontWeight: 'bold',
    },
    lastMessage: {
        fontSize: fonts.sizes.sm,
        color: theme?.colors?.textSecondary || colors.textSecondary,
        marginBottom: spacing.xs,
    },
    lastMessageSender: {
        fontWeight: '600',
        color: theme?.colors?.text || colors.text,
    },
    forumDescription: {
        fontSize: fonts.sizes.sm,
        color: theme?.colors?.textSecondary || colors.textSecondary,
        marginBottom: spacing.xs,
    },
    forumMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    lastMessageTime: {
        fontSize: fonts.sizes.xs,
        color: theme?.colors?.textSecondary || colors.textSecondary,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: fonts.sizes.xs,
        color: theme?.colors?.textSecondary || colors.textSecondary,
        marginLeft: spacing.xs,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: theme?.colors?.primary || colors.primary,
    },
    modal: {
        backgroundColor: theme?.colors?.surface || colors.surface,
        padding: spacing.lg,
        margin: spacing.lg,
        borderRadius: borderRadius.lg,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: fonts.sizes.xl,
        fontWeight: 'bold',
        color: theme?.colors?.text || colors.text,
        marginBottom: spacing.lg,
    },
    input: {
        marginBottom: spacing.md,
        backgroundColor: theme?.colors?.background || colors.background,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: spacing.lg,
    },
    modalButton: {
        marginLeft: spacing.md,
    },
    errorText: {
        color: theme?.colors?.error || colors.error,
        fontSize: fonts.sizes.sm,
        marginTop: -spacing.sm,
        marginBottom: spacing.md,
    },
});