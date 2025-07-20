import { StyleSheet } from 'react-native';

export const chatRoomStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
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
        color: '#999999',
        backgroundColor: '#1a1a1a',
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
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    messageBubble: {
        maxWidth: '75%',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 18,
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#2a2a2a',
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
        color: '#FFFFFF',
        lineHeight: 20,
    },
    ownMessageText: {
        color: '#FFFFFF',
    },
    messageStatus: {
        position: 'absolute',
        bottom: 2,
        right: 8,
    },
    deletedMessage: {
        fontStyle: 'italic',
        color: '#666666',
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
        backgroundColor: '#666666',
        marginHorizontal: 2,
    },
    dot1: {
        animation: 'bounce 1.4s infinite',
        animationDelay: '0s',
    },
    dot2: {
        animation: 'bounce 1.4s infinite',
        animationDelay: '0.2s',
    },
    dot3: {
        animation: 'bounce 1.4s infinite',
        animationDelay: '0.4s',
    },
    typingText: {
        fontSize: 14,
        color: '#666666',
        fontStyle: 'italic',
    },
    inputContainer: {
        backgroundColor: '#0a0a0a',
        borderTopWidth: 1,
        borderTopColor: '#1a1a1a',
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#1a1a1a',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        paddingHorizontal: 16,
        paddingVertical: 8,
        minHeight: 44,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#FFFFFF',
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