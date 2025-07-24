import { format } from 'date-fns';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import { Avatar, Badge } from 'react-native-paper';

import Icon from '../../components/common/Icon.js';
import WebDateTimePicker from '../../components/common/WebDateTimePicker';
import apiClient from '../../services/api/client';
import chatService from '../../services/chatService';
import socketService from '../../services/socketService';
import { useAuth } from '../../store/contexts/AuthContext';
import { useTheme } from '../../store/contexts/ThemeContext';
import { chatRoomStyles } from '../../styles/screens/chat/ChatRoomStyles';
import { devLog, devError } from '../../utils';
import { showErrorAlert } from '../../utils/alerts';

const ChatRoomScreen = ({ route, navigation }) => {
    const theme = useTheme();
    const styles = chatRoomStyles(theme);
    const { user } = useAuth();
    const { roomId, roomTitle } = route.params;

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const flatListRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const eventHandlersRef = useRef({});

    useEffect(() => {
        // Set navigation header
        navigation.setOptions({
            title: roomTitle,
            headerRight: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: 4, 
                        backgroundColor: socketService.isConnected() ? 'green' : 'red',
                        marginRight: 8,
                    }} />
                    {onlineUsers.length > 0 && (
                        <Text style={{ color: theme.colors.textInverse, marginRight: 10 }}>
                            {onlineUsers.length} online
                        </Text>
                    )}
                </View>
            ),
        });
    }, [navigation, roomTitle, theme.colors.primary, theme.colors.textInverse, onlineUsers.length]);

    useEffect(() => {
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

    const refreshMessages = async () => {
        try {
            setRefreshing(true);
            // Clear cache for this room
            await apiClient.clearCache(`/chat/rooms/${roomId}/messages`);
            
            // Reload messages
            const response = await chatService.getRoomMessages(roomId);
            const freshMessages = response?.messages || response || [];
            setMessages(freshMessages);
            devLog('ChatRoom', `Refreshed ${freshMessages.length} messages`);
        } catch (error) {
            devError('ChatRoom', 'Failed to refresh messages', error);
        } finally {
            setRefreshing(false);
        }
    };

    const initializeChat = useCallback(async () => {
        try {

            // Try to connect socket if not connected
            if (!socketService.isConnected()) {
                devLog('ChatRoom', 'Attempting to connect socket...');
                try {
                    await socketService.connect(user._id);
                    devLog('ChatRoom', 'Socket connected successfully');
                } catch (error) {
                    devError('ChatRoom', 'Socket connection failed', error);
                }
            }

            // Setup socket listeners first
            if (socketService.isConnected()) {
                setupSocketListeners();
                
                // Then join the room
                devLog('ChatRoom', `Joining room ${roomId}...`);
                socketService.joinRoom(roomId);
                
                // Listen for room join confirmation
                socketService.once('room_joined', (data) => {
                    if (data.roomId === roomId) {
                        devLog('ChatRoom', `Successfully joined room ${roomId}`);
                    }
                });
            }

            // Load initial messages from API (works even without socket)
            try {
                // Clear any cached messages
                await apiClient.clearCache(`/chat/rooms/${roomId}/messages`);
                
                const response = await chatService.getRoomMessages(roomId);
                const initialMessages = response?.messages || response || [];
                setMessages(initialMessages);
                devLog('ChatRoom', `📥 Loaded ${initialMessages.length} initial messages`);
                
                // Scroll to bottom after loading
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: false });
                }, 100);
            } catch (error) {
                devError('ChatRoom', 'Failed to load messages', error);
            }

            setLoading(false);
        } catch (error) {
            devError('ChatRoom', 'Failed to initialize chat', error);
            setLoading(false);
        }
    }, [roomId, user._id, setupSocketListeners]);

    // Define message handler outside to avoid recreation
    const messageHandler = useCallback((data) => {
            devLog('ChatRoom', '🔴 NEW MESSAGE RECEIVED', {
                messageId: data?._id,
                roomId: data?.roomId,
                currentRoomId: roomId,
                timestamp: new Date().toISOString(),
            });
            
            // Handle different message formats
            const message = data.message || data;
            
            // Validate message structure
            if (!message?._id || !message?.sender || message?.content === undefined) {
                devLog('ChatRoom', 'Invalid message structure, skipping');
                return;
            }
            
            // Check if message is for this room
            const messageRoomId = String(message.roomId || message.room || data.roomId || '');
            const currentRoomId = String(roomId);
            
            if (messageRoomId && messageRoomId !== currentRoomId) {
                devLog('ChatRoom', 'Message for different room', {
                    messageRoom: messageRoomId,
                    currentRoom: currentRoomId
                });
                return;
            }
            
            setMessages((prev) => {
                // Remove any temporary messages
                const filtered = prev.filter(msg => !msg._id.startsWith('temp-'));
                
                // Check if message already exists
                if (filtered.some(msg => msg._id === message._id)) {
                    return filtered;
                }
                
                devLog('ChatRoom', '✅ Adding new message', {
                    messageId: message._id,
                    content: message.content?.substring(0, 30) + '...'
                });
                
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
    }, [roomId]);

    const setupSocketListeners = useCallback(() => {
        devLog('ChatRoom', 'Setting up socket listeners...');
        
        // Use direct socket access for better reliability
        const socket = socketService.socket;
        if (!socket) {
            devError('ChatRoom', 'No socket instance available');
            return;
        }

        // Remove old listeners first to prevent duplicates
        cleanupSocketListeners();

        // New message handler - listen to the correct event name
        socket.on('new_message', messageHandler);
        
        // Other event handlers
        socket.on('message_sent', (data) => {
            devLog('ChatRoom', 'Message sent confirmation:', data);
        });
        
        socket.on('message_deleted', ({ messageId }) => {
            setMessages((prev) =>
                prev.map((msg) => (msg._id === messageId ? { ...msg, deleted: true } : msg)),
            );
        });
        
        socket.on('user_typing', ({ userId, isTyping }) => {
            setTypingUsers((prev) => {
                if (isTyping) {
                    return prev.includes(userId) ? prev : [...prev, userId];
                } else {
                    return prev.filter((id) => id !== userId);
                }
            });
        });
        
        socket.on('room_users', (users) => {
            devLog('ChatRoom', 'Room users update:', users);
            setOnlineUsers(users || []);
        });
        
        socket.on('user_status_update', ({ userId, isOnline }) => {
            devLog('ChatRoom', 'User status update:', { userId, isOnline });
            setOnlineUsers((prev) => {
                if (isOnline) {
                    return prev.includes(userId) ? prev : [...prev, userId];
                } else {
                    return prev.filter(id => id !== userId);
                }
            });
        });

        // Global message handler for debugging
        socket.onAny((eventName, ...args) => {
            if (eventName.includes('message') && !eventName.includes('typing')) {
                devLog('ChatRoom', `📡 Socket event: ${eventName}`, args);
            }
        });
        
        // Store cleanup function reference
        eventHandlersRef.current = { messageHandler };
    }, [messageHandler]);

    const cleanupSocketListeners = useCallback(() => {
        const socket = socketService.socket;
        if (!socket) return;

        socket.off('new_message', eventHandlersRef.current.messageHandler);
        socket.off('message_sent');
        socket.off('message_deleted');
        socket.off('user_typing');
        socket.off('room_users');
        socket.off('user_status_update');
        socket.offAny();
    }, []);


    const sendMessage = async () => {
        if (!inputText.trim() || sending) return;

        const messageText = inputText.trim();
        setInputText('');
        setSending(true);

        try {
            devLog('ChatRoom', 'Sending message via API...');
            
            // Optimistically add message to UI
            const optimisticMessage = {
                _id: `temp-${Date.now()}`,
                content: messageText,
                sender: {
                    _id: user._id,
                    name: user.name,
                    email: user.email
                },
                roomId: roomId,
                room: roomId,
                createdAt: new Date().toISOString(),
                readBy: [{ user: user._id, readAt: new Date() }]
            };
            
            // Add to messages immediately
            setMessages(prev => [...prev, optimisticMessage]);
            
            // Scroll to bottom
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
            
            // Send message via API
            const sentMessage = await chatService.sendMessage(roomId, messageText);
            
            // Replace optimistic message with real one
            setMessages(prev => {
                const filtered = prev.filter(msg => msg._id !== optimisticMessage._id);
                // Check if message already exists (from socket)
                const exists = filtered.some(msg => msg._id === sentMessage._id);
                if (!exists) {
                    return [...filtered, sentMessage].sort((a, b) => 
                        new Date(a.createdAt) - new Date(b.createdAt)
                    );
                }
                return filtered;
            });
            
            devLog('ChatRoom', 'Message sent successfully:', sentMessage);
        } catch (error) {
            devError('ChatRoom', 'Failed to send message', error);
            showErrorAlert('Error', 'Failed to send message');
            setInputText(messageText);
            
            // Remove optimistic message on error
            setMessages(prev => prev.filter(msg => !msg._id.startsWith('temp-')));
        } finally {
            setSending(false);
        }
    };

    const handleTyping = (text) => {
        setInputText(text);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (text.trim()) {
            socketService.typing(roomId, true);
            typingTimeoutRef.current = setTimeout(() => {
                socketService.typing(roomId, false);
            }, 3000);
        } else {
            socketService.typing(roomId, false);
        }
    };

    const renderMessage = ({ item, index }) => {
        // Add null checks
        if (!item || !item.sender || !item.sender._id) {
            return null;
        }
        
        const isOwnMessage = item.sender._id === user._id;
        const showAvatar = index === 0 || messages[index - 1]?.sender._id !== item.sender._id;

        // Group messages by time (5 minute intervals)
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
                            {(() => {
                                try {
                                    return format(new Date(item.createdAt), 'MMM d, h:mm a');
                                } catch (error) {
                                    return 'Invalid date';
                                }
                            })()}
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
                            !showAvatar && !isOwnMessage && styles.messageBubbleWithoutAvatar,
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

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item._id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                    refreshing={refreshing}
                    onRefresh={refreshMessages}
                    inverted={false}
                />

                {typingUsers.length > 0 && (
                    <View style={styles.typingIndicator}>
                        <Text style={styles.typingText}>
                            {typingUsers.length === 1 
                                ? 'Someone is typing...'
                                : `${typingUsers.length} people are typing...`}
                        </Text>
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

export default React.memo(ChatRoomScreen);