// frontend/src/screens/personalChat/PersonalChatDetailScreen.js
import { format } from 'date-fns';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { Avatar } from 'react-native-paper';

import Icon from '../../components/common/Icon.js';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { SCREEN_NAMES } from '../../constants/routes';
import { colors, spacing, fonts } from '../../constants/theme';
import apiClient from '../../services/api/client';
import personalChatService from '../../services/personalChatService';
import socketService from '../../services/socketService';
import { useAuth } from '../../store/contexts/AuthContext';
import { showErrorAlert } from '../../utils/alerts';
import { devLog, devError } from '../../utils';

const PersonalChatDetailScreen = ({ route, navigation }) => {
    const { user } = useAuth();
    const { userId, userName, conversationId } = route.params;

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const flatListRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        // Set navigation options
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={() =>
                        navigation.navigate(SCREEN_NAMES.USER_PROFILE, { userId, userName })
                    }
                    style={{ marginRight: 15 }}
                >
                    <Icon name="account-circle-outline" size={24} color={colors.textInverse} />
                </TouchableOpacity>
            ),
        });

        loadMessages();
        setupSocketListeners();

        return () => {
            cleanupSocketListeners();
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [userId]);

    const loadMessages = async () => {
        try {
            // Clear cache to get fresh messages
            await apiClient.clearCache('/messages');
            
            const data = await personalChatService.getMessages(userId);
            const sortedMessages = (data || []).sort((a, b) => 
                new Date(a.createdAt) - new Date(b.createdAt)
            );
            setMessages(sortedMessages);
            
            devLog('PersonalChat', `Loaded ${sortedMessages.length} messages`);

            // Mark messages as read
            if (conversationId) {
                await personalChatService.markAsRead(conversationId);
            }
            
            // Scroll to bottom after loading
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
            }, 100);
        } catch (error) {
            devError('PersonalChat', 'Failed to load messages:', error);
            showErrorAlert('Error', 'Failed to load messages');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const refreshMessages = async () => {
        setRefreshing(true);
        await loadMessages();
    };

    const setupSocketListeners = () => {
        // Listen for new messages from this user - use both event names for compatibility
        socketService.on('private_message', handleNewMessage);
        socketService.on('personal_message', handleNewMessage);
        socketService.on('new_personal_message', handleNewMessage);
        socketService.on('user_typing', handleUserTyping);
        socketService.on('message_read', handleMessageRead);

        // Also listen with direct socket for better reliability
        if (socketService.socket) {
            socketService.socket.on('private_message', handleNewMessage);
            socketService.socket.on('personal_message', handleNewMessage);
        }
    };

    const cleanupSocketListeners = () => {
        socketService.off('private_message', handleNewMessage);
        socketService.off('personal_message', handleNewMessage);
        socketService.off('new_personal_message', handleNewMessage);
        socketService.off('user_typing', handleUserTyping);
        socketService.off('message_read', handleMessageRead);

        if (socketService.socket) {
            socketService.socket.off('private_message', handleNewMessage);
            socketService.socket.off('personal_message', handleNewMessage);
        }
    };

    const handleNewMessage = useCallback(
        (data) => {
            devLog('PersonalChat', 'Received new message:', data);
            
            // Handle different message formats
            const message = data.message || data;
            
            // Check if message is related to this conversation
            const isRelevant = 
                (message.sender === userId && message.recipient === user._id) ||
                (message.sender === user._id && message.recipient === userId) ||
                (message.sender?._id === userId && message.recipient?._id === user._id) ||
                (message.sender?._id === user._id && message.recipient?._id === userId);
                
            if (!isRelevant) {
                devLog('PersonalChat', 'Message not for this conversation, skipping');
                return;
            }
            
            setMessages((prev) => {
                // Remove any temporary messages
                const filtered = prev.filter(msg => !msg._id.startsWith('temp-'));
                
                // Check if message already exists
                if (filtered.some(msg => msg._id === message._id)) {
                    return filtered;
                }
                
                // Add new message and sort
                const newMessages = [...filtered, message].sort((a, b) => 
                    new Date(a.createdAt) - new Date(b.createdAt)
                );
                
                // Scroll to bottom
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
                
                return newMessages;
            });
        },
        [userId, user._id],
    );

    const handleUserTyping = useCallback(
        ({ userId: typingUserId, isTyping: typing }) => {
            if (typingUserId === userId) {
                setIsTyping(typing);
            }
        },
        [userId],
    );

    const handleMessageRead = useCallback(({ messageIds }) => {
        setMessages((prev) =>
            prev.map((msg) => (messageIds.includes(msg._id) ? { ...msg, read: true } : msg)),
        );
    }, []);

    const sendMessage = async () => {
        if (!inputText.trim() || sending) return;

        const messageText = inputText.trim();
        setInputText('');
        setSending(true);

        try {
            // Optimistically add message to UI
            const optimisticMessage = {
                _id: `temp-${Date.now()}`,
                content: messageText,
                sender: user._id,
                recipient: userId,
                createdAt: new Date().toISOString(),
                read: false,
            };

            setMessages((prev) => [...prev, optimisticMessage]);
            
            // Scroll to bottom immediately
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);

            // Send message and get response
            const sentMessage = await personalChatService.sendMessage(userId, messageText);
            
            devLog('PersonalChat', 'Message sent successfully:', sentMessage);
            
            // Replace optimistic message with real one
            if (sentMessage) {
                setMessages((prev) => {
                    // Remove optimistic message
                    const filtered = prev.filter(msg => msg._id !== optimisticMessage._id);
                    // Add real message (check if not already added by socket)
                    const exists = filtered.some(msg => msg._id === sentMessage._id);
                    if (!exists) {
                        return [...filtered, sentMessage].sort((a, b) => 
                            new Date(a.createdAt) - new Date(b.createdAt)
                        );
                    }
                    return filtered;
                });
            }
        } catch (error) {
            devError('PersonalChat', 'Failed to send message:', error);
            showErrorAlert('Error', 'Failed to send message');
            setInputText(messageText);
            // Remove optimistic message on error
            setMessages((prev) => prev.filter(msg => !msg._id.startsWith('temp-')));
        } finally {
            setSending(false);
        }
    };

    const handleTyping = (text) => {
        setInputText(text);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (text.trim() && socketService.isConnected()) {
            socketService.emit('typing', { recipientId: userId, isTyping: true });

            typingTimeoutRef.current = setTimeout(() => {
                socketService.emit('typing', { recipientId: userId, isTyping: false });
            }, 3000);
        } else if (socketService.isConnected()) {
            socketService.emit('typing', { recipientId: userId, isTyping: false });
        }
    };

    const renderMessage = ({ item, index }) => {
        if (!item || item.sender === undefined) return null;
        
        const isOwnMessage = item.sender === user._id || item.sender?._id === user._id;
        const showTimestamp =
            index === 0 ||
            new Date(item.createdAt) - new Date(messages[index - 1]?.createdAt) > 300000;

        return (
            <>
                {showTimestamp && (
                    <View style={styles.timestampContainer}>
                        <Text style={styles.timestamp}>
                            {format(new Date(item.createdAt), 'HH:mm')}
                        </Text>
                    </View>
                )}

                <View style={[styles.messageContainer, isOwnMessage && styles.ownMessageContainer]}>
                    <View style={[styles.messageBubble, isOwnMessage && styles.ownMessageBubble]}>
                        <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText]}>
                            {item.content}
                        </Text>

                        {isOwnMessage && (
                            <View style={styles.messageStatus}>
                                <Icon
                                    name={item.read ? 'check-all' : 'check'}
                                    size={16}
                                    color={item.read ? '#60A5FA' : '#FFFFFF99'}
                                />
                            </View>
                        )}
                    </View>
                </View>
            </>
        );
    };

    if (loading) {
        return <LoadingSpinner fullScreen text="Loading messages..." />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() =>
                        flatListRef.current?.scrollToEnd({ animated: false })
                    }
                    refreshing={refreshing}
                    onRefresh={refreshMessages}
                    ListFooterComponent={
                        isTyping ? (
                            <View style={styles.typingIndicator}>
                                <Text style={styles.typingText}>{userName} is typing...</Text>
                            </View>
                        ) : null
                    }
                />

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            value={inputText}
                            onChangeText={handleTyping}
                            placeholder="Type a message"
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            maxLength={1000}
                            onSubmitEditing={sendMessage}
                            blurOnSubmit={false}
                            editable={!sending}
                        />

                        <TouchableOpacity
                            onPress={sendMessage}
                            disabled={!inputText.trim() || sending}
                            style={[
                                styles.sendButton,
                                (!inputText.trim() || sending) && styles.sendButtonDisabled,
                            ]}
                        >
                            {sending ? (
                                <ActivityIndicator size="small" color={colors.primary} />
                            ) : (
                                <Icon
                                    name="send"
                                    size={24}
                                    color={
                                        inputText.trim() && !sending ? colors.primary : colors.disabled
                                    }
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    messagesList: {
        padding: spacing.md,
        paddingBottom: spacing.xs,
    },
    timestampContainer: {
        alignItems: 'center',
        marginVertical: spacing.md,
    },
    timestamp: {
        fontSize: fonts.sizes.sm,
        color: colors.textSecondary,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 12,
    },
    messageContainer: {
        marginBottom: spacing.sm,
        alignItems: 'flex-start',
    },
    ownMessageContainer: {
        alignItems: 'flex-end',
    },
    messageBubble: {
        maxWidth: '80%',
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: 18,
        borderTopLeftRadius: 4,
    },
    ownMessageBubble: {
        backgroundColor: colors.primary,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 4,
    },
    messageText: {
        fontSize: fonts.sizes.md,
        color: colors.text,
    },
    ownMessageText: {
        color: colors.textInverse,
    },
    messageStatus: {
        marginTop: spacing.xs,
        alignSelf: 'flex-end',
    },
    typingIndicator: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    typingText: {
        fontSize: fonts.sizes.sm,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
    inputContainer: {
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: colors.background,
        borderRadius: 25,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
    },
    input: {
        flex: 1,
        fontSize: fonts.sizes.md,
        color: colors.text,
        maxHeight: 100,
        paddingVertical: spacing.sm,
    },
    sendButton: {
        padding: spacing.sm,
        marginLeft: spacing.sm,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});

export default React.memo(PersonalChatDetailScreen);