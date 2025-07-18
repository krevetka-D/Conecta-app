// frontend/src/styles/screens/forums/ForumDetailScreenStyles.js
import { StyleSheet } from 'react-native';

export const forumDetailStyles = (theme) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    forumHeader: {
        padding: theme.spacing.m,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.backdrop,
    },
    forumTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.s,
    },
    forumDescription: {
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
    listContent: {
        padding: theme.spacing.m,
    },
    threadCard: {
        marginBottom: theme.spacing.m,
        backgroundColor: theme.colors.card,
        borderRadius: theme.roundness,
    },
    threadHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    threadInfo: {
        flex: 1,
    },
    threadTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    threadMeta: {
        flexDirection: 'row',
        gap: theme.spacing.m,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        marginLeft: theme.spacing.xs,
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    myThreadBadge: {
        marginTop: theme.spacing.s,
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.primary + '20',
        paddingHorizontal: theme.spacing.s,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.roundness,
    },
    myThreadText: {
        fontSize: 12,
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.primary,
    },
    modal: {
        backgroundColor: theme.colors.background,
        padding: theme.spacing.l,
        margin: theme.spacing.l,
        borderRadius: theme.roundness,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: theme.spacing.l,
        textAlign: 'center',
    },
    input: {
        marginBottom: theme.spacing.m,
    },
    errorText: {
        color: theme.colors.error,
        marginBottom: theme.spacing.m,
        marginTop: -theme.spacing.s,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: theme.spacing.m,
    },
    modalButton: {
        marginLeft: theme.spacing.m,
    },
});