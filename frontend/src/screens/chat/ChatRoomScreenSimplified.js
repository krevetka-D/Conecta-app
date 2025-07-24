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
} from 'react-native';
import { Avatar } from 'react-native-paper';

import Icon from '../../components/common/Icon.js';
import { colors } from '../../constants/theme';
import { useChatSocketEvents } from '../../hooks/useChatSocketEvents';
import chatService from '../../services/chatService';
import socketService from '../../services/socketService';
import { useAuth } from '../../store/contexts/AuthContext';
import { useTheme } from '../../store/contexts/ThemeContext';
import { chatRoomStyles } from '../../styles/screens/chat/ChatRoomStyles';
import { devLog, devError } from '../../utils';
import { showErrorAlert } from '../../utils/alerts';

const ChatRoomScreenSimplified = ({ route, navigation }) => {
    const theme = useTheme();
    const styles = chatRoomStyles(theme);
    const { user } = useAuth();
    const { roomId, roomTitle } = route.params;

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const [connectionError, setConnectionError] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const flatListRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Handle new messages
    const handleNewMessage = useCallback((data) => {
        devLog('ChatRoom', 'Processing new message:', data);
        
        // Handle both direct message and wrapped message formats
        const newMessage = data.message || data;
        
        // Only process messages for this room
        if (data.roomId && data.roomId !== roomId) {
            devLog('ChatRoom', 'Message for different room, ignoring');
            return;
        }
        
        setMessages((prev) => {
            // Check for duplicates
            const exists = prev.some(msg => msg._id === newMessage._id);
            if (exists) {
                devLog('ChatRoom', 'Message already exists, skipping');
                return prev;
            }
            devLog('ChatRoom', 'Adding new message to list');
            return [...prev, newMessage];
        });
        
        // Scroll to bottom
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [roomId]);

    // Handle typing indicators
    const handleUserTyping = useCallback(({ userId, isTyping }) => {
        if (userId === user._id) return; // Don't show own typing
        
        setTypingUsers((prev) => {
            if (isTyping) {
                return prev.includes(userId) ? prev : [...prev, userId];
            } else {
                return prev.filter((id) => id !== userId);
            }
        });
    }, [user._id]);

    // Handle room users update
    const handleRoomUsers = useCallback((users) => {
        devLog('ChatRoom', 'Room users update:', users);
    }, []);

    // Use the socket events hook
    const { sendTyping } = useChatSocketEvents(roomId, {
        onNewMessage: handleNewMessage,
        onUserTyping: handleUserTyping,
        onRoomUsers: handleRoomUsers,
    });

    // Set navigation header
    useEffect(() => {
        navigation.setOptions({
            title: roomTitle,
            headerRight: () => (
                <View style={{ marginRight: 10 }}>
                    <View style={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: 4, 
                        backgroundColor: isConnected ? 'green' : 'red', 
                    }} />
                </View>
            ),
        });
    }, [navigation, roomTitle, isConnected]);

    // Monitor connection status and events
    useEffect(() => {
        const checkConnection = () => {
            const connected = socketService.isConnected();
            setIsConnected(connected);
            
            if (connected && !connectionError) {
                setConnectionError(false);
            }
        };

        checkConnection();
        const interval = setInterval(checkConnection, 2000);
        
        // Listen for connection state changes
        const handleConnectionChange = (state) => {
            devLog('ChatRoom', 'Connection state changed:', state);
            setIsConnected(state === 'connected');
            if (state === 'connected') {
                // Rejoin room on reconnection
                socketService.joinRoom(roomId);
            }
        };
        
        socketService.on('connection_state_change', handleConnectionChange);

        return () => {
            clearInterval(interval);
            socketService.off('connection_state_change', handleConnectionChange);
        };
    }, [roomId, connectionError]);

    // Load initial messages
    useEffect(() => {
        const loadMessages = async () => {
            setLoading(true);
            setConnectionError(false);
            
            try {
                const initialMessages = await chatService.getRoomMessages(roomId);
                setMessages(initialMessages || []);
                devLog('ChatRoom', `Loaded ${initialMessages?.length || 0} initial messages`);
            } catch (error) {
                devError('ChatRoom', 'Failed to load messages', error);
                setConnectionError(true);
            } finally {
                setLoading(false);
            }
        };

        loadMessages();
    }, [roomId]);

    // Send message
    const sendMessage = async () => {
        if (!inputText.trim() || sending) return;

        const messageText = inputText.trim();
        setInputText('');
        setSending(true);

        try {
            devLog('ChatRoom', 'Sending message via API...');
            const sentMessage = await chatService.sendMessage(roomId, messageText);
            
            // Message will be received via socket event
            devLog('ChatRoom', 'Message sent successfully:', sentMessage);
        } catch (error) {
            devError('ChatRoom', 'Failed to send message', error);
            showErrorAlert('Error', 'Failed to send message');
            setInputText(messageText); // Restore text
        } finally {
            setSending(false);
        }
    };

    // Handle typing
    const handleTyping = (text) => {
        setInputText(text);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (text.trim()) {
            sendTyping(true);
            typingTimeoutRef.current = setTimeout(() => {
                sendTyping(false);
            }, 3000);
        } else {
            sendTyping(false);
        }
    };

    // Render message
    const renderMessage = ({ item, index }) => {
        const isOwnMessage = item.sender._id === user._id;
        const showAvatar = index === 0 || messages[index - 1]?.sender._id !== item.sender._id;
        const showTimestamp =
            index === 0 ||
            new Date(item.createdAt) - new Date(messages[index - 1]?.createdAt) > 300000;

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
                            {format(new Date(item.createdAt), 'MMM d, h:mm a')}
                        </Text>
                    </View>
                )}
                <View style={[styles.messageContainer, isOwnMessage && styles.ownMessageContainer]}>
                    {!isOwnMessage && showAvatar && (
                        <Avatar.Text
                            size={32}
                            label={item.sender.name?.[0]?.toUpperCase() || '?'}
                            style={styles.avatar}
                        />
                    )}
                    <View
                        style={[
                            styles.messageBubble,
                            isOwnMessage ? styles.ownMessage : styles.otherMessage,
                            !showAvatar && !isOwnMessage && styles.messageBubbleNoAvatar,
                        ]}
                    >
                        {!isOwnMessage && showAvatar && (
                            <Text style={styles.senderName}>{item.sender.name}</Text>
                        )}
                        <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText]}>
                            {item.content}
                        </Text>
                    </View>
                </View>
            </>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading chat...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={90}
            >
                {connectionError && (
                    <View style={styles.connectionError}>
                        <Icon name="wifi-off" size={16} color={colors.error} />
                        <Text style={styles.connectionErrorText}>Connection issues</Text>
                    </View>
                )}

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item._id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                />

                {typingUsers.length > 0 && (
                    <View style={styles.typingIndicator}>
                        <Text style={styles.typingText}>Someone is typing...</Text>
                    </View>
                )}

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={handleTyping}
                        placeholder="Type a message..."
                        placeholderTextColor={theme.colors.placeholder}
                        multiline
                        maxLength={1000}
                        editable={!sending}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, sending && styles.sendButtonDisabled]}
                        onPress={sendMessage}
                        disabled={!inputText.trim() || sending}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                        ) : (
                            <Icon
                                name="send"
                                size={24}
                                color={
                                    inputText.trim() ? theme.colors.primary : theme.colors.disabled
                                }
                            />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default React.memo(ChatRoomScreenSimplified);