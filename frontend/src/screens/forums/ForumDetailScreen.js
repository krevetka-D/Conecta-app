// frontend/src/screens/forums/ForumDetailScreen.js
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
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Menu, Divider } from 'react-native-paper';
import { Avatar, Badge } from 'react-native-paper';

import Icon from '../../components/common/Icon.js';
import { SCREEN_NAMES } from '../../constants/routes';
import chatService from '../../services/chatService';
import personalChatService from '../../services/personalChatService';
import socketService from '../../services/socketService';
import { useAuth } from '../../store/contexts/AuthContext';
import { useTheme } from '../../store/contexts/ThemeContext';
import { chatRoomStyles } from '../../styles/screens/chat/ChatRoomStyles';
import { showErrorAlert } from '../../utils/alerts';
import { devLog, devError } from '../../utils';

const ForumDetailScreen = ({ route, navigation }) => {
    const theme = useTheme();
    const styles = chatRoomStyles(theme);
    const { user } = useAuth();
    const { roomId, roomTitle } = route.params;

    const [menuVisible, setMenuVisible] = useState({});
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [connectionError, setConnectionError] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('connecting');

    const flatListRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        // Set navigation header
        navigation.setOptions({
            title: roomTitle,
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => navigation.navigate('ChatInfo', { roomId, roomTitle })}
                    style={{ marginRight: 15 }}
                >
                    <Icon name="information-outline" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
            ),
        });

        // Connect to socket and join room
        initializeChat();

        return () => {
            // Leave room and cleanup
            if (socketService.isConnected()) {
                socketService.leaveRoom(roomId);
            }
            cleanupSocketListeners();
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [roomId]);

    // Add connection status listener
    useEffect(() => {
        const handleConnectionChange = (status) => {
            setConnectionStatus(status);
        };

        socketService.on('connect', () => handleConnectionChange('connected'));
        socketService.on('disconnect', () => handleConnectionChange('disconnected'));
        socketService.on('reconnecting', () => handleConnectionChange('reconnecting'));

        return () => {
            socketService.off('connect', handleConnectionChange);
            socketService.off('disconnect', handleConnectionChange);
            socketService.off('reconnecting', handleConnectionChange);
        };
    }, []);

    const handleStartChat = async (senderId, senderName) => {
        try {
            // Start or get existing conversation
            const conversation = await personalChatService.startConversation(senderId);

            // Navigate to personal chat
            navigation.navigate(SCREEN_NAMES.PERSONAL_CHAT, {
                screen: SCREEN_NAMES.PERSONAL_CHAT_DETAIL,
                params: {
                    userId: senderId,
                    userName: senderName,
                    conversationId: conversation.conversationId,
                },
            });
        } catch (error) {
            devError('ForumDetail', 'Failed to start conversation', error);
            showErrorAlert('Error', 'Failed to start conversation');
        }
    };

    const initializeChat = async () => {
        try {
            setConnectionError(false);

            // In development with mock mode, skip socket connection
            if (__DEV__ && !socketService.isConnected()) {
                devLog('ForumDetail', 'Development mode: Using mock data');
                setConnectionError(false);

                // Load initial messages from API/Mock
                try {
                    const initialMessages = await chatService.getRoomMessages(roomId);
                    // Ensure messages is always an array
                    setMessages(Array.isArray(initialMessages) ? initialMessages : []);
                } catch (error) {
                    devError('ForumDetail', 'Failed to load messages', error);
                    setMessages([]);
                }

                setLoading(false);
                return;
            }

            // Production mode or when socket is needed
            if (!socketService.isConnected()) {
                devLog('ForumDetail', 'Attempting to connect socket...');
                try {
                    await socketService.connect(user._id);
                    devLog('ForumDetail', 'Socket connected successfully');
                } catch (error) {
                    devError('ForumDetail', 'Socket connection failed', error);
                    setConnectionError(true);
                    // Continue anyway to load messages from API
                }
            }

            // Join the room if connected
            if (socketService.isConnected()) {
                socketService.joinRoom(roomId);
                // Setup socket listeners
                setupSocketListeners();
            }

            // Load initial messages from API (works even without socket)
            try {
                const initialMessages = await chatService.getRoomMessages(roomId);
                // Ensure messages is always an array
                setMessages(Array.isArray(initialMessages) ? initialMessages : []);
            } catch (error) {
                devError('ForumDetail', 'Failed to load messages', error);
                setMessages([]);
            }

            setLoading(false);
        } catch (error) {
            devError('ForumDetail', 'Failed to initialize chat', error);
            setLoading(false);
            setConnectionError(true);
            setMessages([]);
        }
    };

    const setupSocketListeners = () => {
        socketService.on('newMessage', handleNewMessage);
        socketService.on('messageDeleted', handleMessageDeleted);
        socketService.on('userTyping', handleUserTyping);
        socketService.on('roomUsers', handleRoomUsers);
    };

    const cleanupSocketListeners = () => {
        socketService.off('newMessage', handleNewMessage);
        socketService.off('messageDeleted', handleMessageDeleted);
        socketService.off('userTyping', handleUserTyping);
        socketService.off('roomUsers', handleRoomUsers);
    };

    const handleNewMessage = useCallback((message) => {
        setMessages((prev) => {
            // Ensure prev is an array
            const prevMessages = Array.isArray(prev) ? prev : [];
            return [...prevMessages, message];
        });
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, []);

    const handleMessageDeleted = useCallback(({ messageId }) => {
        setMessages((prev) => {
            // Ensure prev is an array
            const prevMessages = Array.isArray(prev) ? prev : [];
            return prevMessages.map((msg) =>
                msg._id === messageId ? { ...msg, deleted: true } : msg,
            );
        });
    }, []);

    const handleUserTyping = useCallback(({ userId, isTyping }) => {
        setTypingUsers((prev) => {
            // Ensure prev is an array
            const prevUsers = Array.isArray(prev) ? prev : [];
            if (isTyping) {
                return prevUsers.includes(userId) ? prevUsers : [...prevUsers, userId];
            } else {
                return prevUsers.filter((id) => id !== userId);
            }
        });
    }, []);

    const handleRoomUsers = useCallback((users) => {
        // Ensure users is an array
        setOnlineUsers(Array.isArray(users) ? users : []);
    }, []);

    const sendMessage = async () => {
        if (!inputText.trim() || sending) return;

        const messageText = inputText.trim();
        setInputText('');
        setSending(true);

        try {
            if (socketService.isConnected()) {
                socketService.sendMessage({
                    roomId,
                    content: messageText,
                    type: 'text',
                });
            } else {
                // Fallback to API
                await chatService.sendMessage(roomId, messageText);
                // Reload messages
                const updatedMessages = await chatService.getRoomMessages(roomId);
                setMessages(Array.isArray(updatedMessages) ? updatedMessages : []);
            }
        } catch (error) {
            devError('ForumDetail', 'Failed to send message', error);
            showErrorAlert('Error', 'Failed to send message');
            setInputText(messageText);
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
            socketService.typing(roomId, true);
            typingTimeoutRef.current = setTimeout(() => {
                socketService.typing(roomId, false);
            }, 3000);
        } else if (socketService.isConnected()) {
            socketService.typing(roomId, false);
        }
    };

    const renderMessage = ({ item, index }) => {
        if (!item || !item.sender || !user) return null;

        const isOwnMessage = item.sender._id === user._id;
        const messageList = Array.isArray(messages) ? messages : [];
        const showAvatar = index === 0 || messageList[index - 1]?.sender._id !== item.sender._id;

        // Group messages by time (5 minute intervals)
        const showTimestamp =
            index === 0 ||
            (messageList[index - 1] &&
                new Date(item.createdAt) - new Date(messageList[index - 1]?.createdAt) > 300000);

        if (item.deleted) {
            return (
                <View style={[styles.messageContainer, isOwnMessage && styles.ownMessageContainer]}>
                    <Text style={styles.deletedMessage}>Message deleted</Text>
                </View>
            );
        }

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
                    {showAvatar && !isOwnMessage && (
                        <Menu
                            visible={menuVisible[item._id] || false}
                            onDismiss={() =>
                                setMenuVisible((prev) => ({ ...prev, [item._id]: false }))
                            }
                            anchor={
                                <TouchableOpacity
                                    style={styles.avatarContainer}
                                    onPress={() =>
                                        setMenuVisible((prev) => ({ ...prev, [item._id]: true }))
                                    }
                                    onLongPress={() =>
                                        setMenuVisible((prev) => ({ ...prev, [item._id]: true }))
                                    }
                                >
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>
                                            {item.sender.name.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            }
                            contentStyle={styles.menuContent}
                        >
                            <Menu.Item
                                onPress={() => {
                                    setMenuVisible((prev) => ({ ...prev, [item._id]: false }));
                                    navigation.navigate(SCREEN_NAMES.USER_PROFILE, {
                                        userId: item.sender._id,
                                        userName: item.sender.name,
                                    });
                                }}
                                title="View Profile"
                                leadingIcon="account"
                            />
                            <Divider />
                            <Menu.Item
                                onPress={() => {
                                    setMenuVisible((prev) => ({ ...prev, [item._id]: false }));
                                    handleStartChat(item.sender._id, item.sender.name);
                                }}
                                title="Start Chatting"
                                leadingIcon="message"
                            />
                        </Menu>
                    )}

                    <View
                        style={[
                            styles.messageBubble,
                            isOwnMessage && styles.ownMessageBubble,
                            !showAvatar && !isOwnMessage && styles.messageBubbleWithoutAvatar,
                        ]}
                    >
                        {!isOwnMessage && showAvatar && (
                            <TouchableOpacity
                                onPress={() =>
                                    setMenuVisible((prev) => ({ ...prev, [item._id]: true }))
                                }
                            >
                                <Text style={styles.senderName}>{item.sender.name}</Text>
                            </TouchableOpacity>
                        )}

                        <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText]}>
                            {item.content}
                        </Text>

                        {isOwnMessage && (
                            <View style={styles.messageStatus}>
                                <Icon
                                    name={item.readBy?.length > 1 ? 'check-all' : 'check'}
                                    size={16}
                                    color={item.readBy?.length > 1 ? '#60A5FA' : '#FFFFFF99'}
                                />
                            </View>
                        )}
                    </View>
                </View>
            </>
        );
    };

    const renderTypingIndicator = () => {
        const typingUsersList = Array.isArray(typingUsers) ? typingUsers : [];
        if (typingUsersList.length === 0) return null;

        return (
            <View style={styles.typingContainer}>
                <View style={styles.typingDots}>
                    <View style={[styles.dot, styles.dot1]} />
                    <View style={[styles.dot, styles.dot2]} />
                    <View style={[styles.dot, styles.dot3]} />
                </View>
                <Text style={styles.typingText}>
                    {typingUsersList.length === 1
                        ? 'Someone is typing'
                        : 'Multiple people are typing'}
                </Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    // Ensure messages is always an array
    const messageList = Array.isArray(messages) ? messages : [];

    return (
        <SafeAreaView style={styles.container}>
            {connectionStatus !== 'connected' && (
                <View style={styles.connectionStatus}>
                    <Text style={styles.connectionStatusText}>
                        {connectionStatus === 'reconnecting' ? 'Reconnecting...' : 'Offline Mode'}
                    </Text>
                </View>
            )}

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messageList}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item?._id || String(Math.random())}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() =>
                        flatListRef.current?.scrollToEnd({ animated: false })
                    }
                    ListFooterComponent={renderTypingIndicator}
                    extraData={menuVisible}
                />

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            value={inputText}
                            onChangeText={handleTyping}
                            placeholder="Type a message"
                            placeholderTextColor={theme.colors.textSecondary}
                            multiline
                            maxLength={1000}
                            onSubmitEditing={sendMessage}
                            blurOnSubmit={false}
                        />

                        <TouchableOpacity
                            onPress={sendMessage}
                            disabled={!inputText.trim() || sending}
                            style={[
                                styles.sendButton,
                                (!inputText.trim() || sending) && styles.sendButtonDisabled,
                            ]}
                        >
                            <Icon
                                name="send"
                                size={24}
                                color={
                                    inputText.trim() && !sending
                                        ? theme.colors.primary
                                        : theme.colors.disabled
                                }
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default React.memo(ForumDetailScreen);
