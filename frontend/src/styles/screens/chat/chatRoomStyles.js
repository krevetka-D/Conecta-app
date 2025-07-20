import { StyleSheet } from 'react-native';

export const chatRoomStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messagesList: {
        padding: theme.spacing.m,
        paddingBottom: theme.spacing.s,
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: theme.spacing.s,
        alignItems: 'flex-end',
    },
    ownMessageContainer: {
        justifyContent: 'flex-end',
    },
    avatar: {
        marginRight: theme.spacing.s,
        backgroundColor: theme.colors.primary,
    },
    messageBubble: {
        maxWidth: '75%',
        padding: theme.spacing.m,
        borderRadius: theme.roundness * 2,
        backgroundColor: theme.colors.surface,
    },
    ownMessageBubble: {
        backgroundColor: theme.colors.primary,
    },
    senderName: {
        fontSize: 12,
        color: theme.colors.primary,
        fontWeight: 'bold',
        marginBottom: theme.spacing.xs,
    },
    messageText: {
        fontSize: 16,
        color: theme.colors.text,
        lineHeight: 22,
    },
    ownMessageText: {
        color: theme.colors.onPrimary,
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.xs,
    },
    messageTime: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginRight: theme.spacing.xs,
    },
    ownMessageTime: {
        color: theme.colors.onPrimary + '99',
    },
    deletedMessage: {
        fontStyle: 'italic',
        color: theme.colors.textSecondary,
    },
    replyContainer: {
        backgroundColor: theme.colors.backdrop + '20',
        padding: theme.spacing.s,
        borderRadius: theme.roundness,
        marginBottom: theme.spacing.s,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.primary,
    },
    replyText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    reactionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: theme.spacing.xs,
    },
    reaction: {
        backgroundColor: theme.colors.backdrop + '30',
        borderRadius: 12,
        paddingHorizontal: theme.spacing.s,
        paddingVertical: 2,
        marginRight: theme.spacing.xs,
        marginTop: theme.spacing.xs,
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.m,
        paddingTop: 0,
    },
    typingText: {
        marginLeft: theme.spacing.s,
        color: theme.colors.textSecondary,
        fontSize: 14,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: theme.spacing.m,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        alignItems: 'flex-end',
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        backgroundColor: theme.colors.background,
        borderRadius: 20,
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        marginRight: theme.spacing.s,
        fontSize: 16,
        color: theme.colors.text,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});