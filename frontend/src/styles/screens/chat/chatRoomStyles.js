// frontend/src/styles/screens/chat/ChatRoomStyles.js
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
        backgroundColor: theme.colors.background,
    },
    connectionStatus: {
        backgroundColor: theme.colors.warning,
        paddingVertical: 4,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    connectionStatusText: {
        color: theme.colors.background,
        fontSize: 12,
        fontWeight: '600',
    },
    messagesList: {
        paddingHorizontal: 10,
        paddingBottom: 10,
        paddingTop: 10,
    },
    timestampContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    timestamp: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: 4,
        alignItems: 'flex-end',
        paddingHorizontal: 8,
    },
    ownMessageContainer: {
        justifyContent: 'flex-end',
    },
    avatarContainer: {
        marginRight: 8,
        width: 32,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: theme.colors.textInverse,
        fontSize: 14,
        fontWeight: 'bold',
    },
    messageBubble: {
        maxWidth: '75%',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 18,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    messageBubbleWithoutAvatar: {
        marginLeft: 40,
    },
    ownMessageBubble: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    senderName: {
        fontSize: 12,
        color: theme.colors.primary,
        fontWeight: '600',
        marginBottom: 2,
    },
    messageText: {
        fontSize: 16,
        color: theme.colors.text,
        lineHeight: 20,
    },
    ownMessageText: {
        color: theme.colors.textInverse,
    },
    messageStatus: {
        position: 'absolute',
        bottom: 2,
        right: 8,
    },
    deletedMessage: {
        fontStyle: 'italic',
        color: theme.colors.textSecondary,
        fontSize: 14,
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    typingDots: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.textSecondary,
        marginHorizontal: 2,
    },
    typingText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
    },
    inputContainer: {
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: theme.colors.background,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: 16,
        paddingVertical: 8,
        minHeight: 44,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.text,
        maxHeight: 100,
        paddingTop: 0,
        paddingBottom: 0,
        paddingVertical: 4,
    },
    sendButton: {
        marginLeft: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});