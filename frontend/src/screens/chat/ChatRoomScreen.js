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
import { Avatar, Badge } from 'react-native-paper';

import Icon from '../../components/common/Icon.js';
import WebDateTimePicker from '../../components/common/WebDateTimePicker';
import { colors } from '../../constants/theme';
import apiClient from '../../services/api/client';
import chatService from '../../services/chatService';
import socketService from '../../services/socketService';
import { useAuth } from '../../store/contexts/AuthContext';
import { useTheme } from '../../store/contexts/ThemeContext';
import { chatRoomStyles } from '../../styles/screens/chat/ChatRoomStyles';
import { devLog, devError } from '../../utils';
import { showErrorAlert } from '../../utils/alerts';
import { ensureChatSocketConnection, setupChatListeners } from '../../utils/chatSocketFix';
import { setupRealtimeMessageListener } from '../../utils/realtimeMessageFix';
import { socketDebugger } from '../../utils/socketDebugger';
import { testDirectSocketConnection } from '../../utils/connectionTest';
import { useForceRealtimeUpdate } from '../../utils/forceRealtimeUpdate';

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
    const [connectionError, setConnectionError] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [debugInfo, setDebugInfo] = useState({
        socketConnected: false,
        socketAuthenticated: false,
        roomJoined: false,
        eventsRegistered: false,
        lastEvent: null,
    });

    const flatListRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Debug function
    const updateDebugInfo = (key, value) => {
        setDebugInfo(prev => ({
            ...prev,
            [key]: value,
            lastUpdate: new Date().toISOString(),
        }));
        devLog('ChatDebug', `${key}: ${value}`);
    };

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
                        backgroundColor: debugInfo.socketConnected ? 'green' : 'red',
                        marginRight: 8,
                    }} />
                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert(
                                'Debug Options',
                                'Choose an action:',
                                [
                                    {
                                        text: 'View Debug Info',
                                        onPress: () => {
                                            const debugData = {
                                                ...debugInfo,
                                                socketDebugger: socketDebugger.getDebugInfo(),
                                            };
                                            Alert.alert('Debug Info', JSON.stringify(debugData, null, 2));
                                        },
                                    },
                                    {
                                        text: 'Test Socket Connection',
                                        onPress: () => {
                                            devLog('ChatRoom', 'Running socket connection test...');
                                            testDirectSocketConnection();
                                        },
                                    },
                                    {
                                        text: 'Cancel',
                                        style: 'cancel',
                                    },
                                ],
                            );
                        }}
                        style={{ marginRight: 15 }}
                    >
                        <Icon name="bug" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation, roomTitle, theme.colors.primary, user._id, debugInfo]);

    // Setup force realtime update as a fallback
    const fetchLatestMessages = useCallback(async () => {
        try {
            await apiClient.clearCache(`/chat/rooms/${roomId}/messages`);
            const response = await chatService.getRoomMessages(roomId);
            const latestMessages = response?.messages || response || [];
            return latestMessages;
        } catch (error) {
            devError('ChatRoom', 'Failed to fetch latest messages', error);
            return [];
        }
    }, [roomId]);

    const handlePolledMessages = useCallback((newMessages) => {
        setMessages((prevMessages) => {
            // Create a map of existing messages by ID
            const existingIds = new Set(prevMessages.map(msg => msg._id));
            
            // Filter truly new messages
            const trulyNewMessages = newMessages.filter(msg => !existingIds.has(msg._id));
            
            if (trulyNewMessages.length > 0) {
                devLog('ChatRoom', `Polling found ${trulyNewMessages.length} new messages`);
                const allMessages = [...prevMessages, ...trulyNewMessages].sort((a, b) => 
                    new Date(a.createdAt) - new Date(b.createdAt)
                );
                return allMessages;
            }
            
            return prevMessages;
        });
    }, []);

    useEffect(() => {
        // Start socket debugger
        const stopDebugger = socketDebugger.start(roomId);
        
        // Connect to socket and join room
        initializeChat();
        
        // Setup force realtime update as fallback (polls every 2 seconds)
        const stopPolling = useForceRealtimeUpdate(
            roomId,
            fetchLatestMessages,
            handlePolledMessages,
            { enabled: true, interval: 2000 }
        );

        return () => {
            // Stop debugger
            stopDebugger();
            
            // Stop polling
            stopPolling();
            
            // Leave room and cleanup
            if (socketService.isConnected()) {
                socketService.leaveRoom(roomId);
                updateDebugInfo('roomJoined', false);
            }
            
            // Cleanup handled by useEffect return function
            
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [roomId, fetchLatestMessages, handlePolledMessages]);

    const refreshMessages = async () => {
        try {
            setRefreshing(true);
            // Clear cache for this room
            await apiClient.clearCache(`/chat/rooms/${roomId}/messages`);
            
            // Reload messages
            const freshMessages = await chatService.getRoomMessages(roomId);
            setMessages(freshMessages || []);
            devLog('ChatRoom', `Refreshed ${freshMessages?.length || 0} messages`);
        } catch (error) {
            devError('ChatRoom', 'Failed to refresh messages', error);
        } finally {
            setRefreshing(false);
        }
    };

    const initializeChat = async () => {
        try {
            setConnectionError(false);

            // Use the chat socket fix to ensure proper connection
            const connected = await ensureChatSocketConnection(user._id, roomId);
            
            updateDebugInfo('socketConnected', connected);
            updateDebugInfo('socketAuthenticated', socketService.isAuthenticated);
            updateDebugInfo('roomJoined', connected);
            
            // Double-check room join with direct emit
            if (connected && socketService.socket) {
                devLog('ChatRoom', 'Double-checking room join...');
                
                // Listen for room join confirmation
                socketService.socket.on('room_joined', (data) => {
                    devLog('ChatRoom', '✅ Room join confirmed:', data);
                    updateDebugInfo('roomJoinConfirmed', true);
                    updateDebugInfo('roomMemberCount', data.memberCount);
                });
                
                socketService.socket.emit('joinRoom', roomId);
                
                // Also try with the service method
                socketService.joinRoom(roomId);
            }
            
            if (!connected) {
                setConnectionError(true);
                updateDebugInfo('error', 'Failed to establish socket connection');
            } else {
                // Setup listeners using the fix
                const cleanup = setupChatListeners(roomId, {
                    onNewMessage: handleNewMessage,
                    onUserTyping: handleUserTyping,
                    onRoomUsers: handleRoomUsers,
                });
                
                // Also setup enhanced real-time message listener
                const realtimeCleanup = setupRealtimeMessageListener(roomId, handleNewMessage);
                
                // Add direct socket listener for new_message (like personal chat)
                if (socketService.socket) {
                    const directHandler = (data) => {
                        devLog('ChatRoom', 'Direct socket new_message:', data);
                        handleNewMessage(data);
                    };
                    socketService.socket.on('new_message', directHandler);
                    
                    // Store cleanup for direct handler
                    const directCleanup = () => {
                        if (socketService.socket) {
                            socketService.socket.off('new_message', directHandler);
                        }
                    };
                    
                    return () => {
                        cleanup();
                        realtimeCleanup();
                        directCleanup();
                    };
                }
                
                // Return cleanup function for useEffect
                return () => {
                    cleanup();
                    realtimeCleanup();
                };
                updateDebugInfo('eventsRegistered', true);
            }

            // Load initial messages from API (works even without socket)
            try {
                // Clear any cached messages
                await apiClient.clearCache(`/chat/rooms/${roomId}/messages`);
                
                const response = await chatService.getRoomMessages(roomId);
                const initialMessages = response?.messages || response || [];
                setMessages(initialMessages);
                devLog('ChatRoom', `📥 Loaded ${initialMessages.length} initial messages`, {
                    responseType: typeof response,
                    hasMessagesKey: !!response?.messages,
                    firstMessage: initialMessages[0],
                    lastMessage: initialMessages[initialMessages.length - 1],
                });
            } catch (error) {
                devError('ChatRoom', 'Failed to load messages', error);
            }

            setLoading(false);
        } catch (error) {
            devError('ChatRoom', 'Failed to initialize chat', error);
            setLoading(false);
            setConnectionError(true);
        }
    };

    const setupSocketListeners = () => {
        devLog('ChatRoom', 'Setting up socket listeners...');
        
        // Use direct socket access for debugging
        const socket = socketService.socket;
        if (!socket) {
            devError('ChatRoom', 'No socket instance available');
            return;
        }

        // Add listeners with debugging
        socket.on('new_message', (data) => {
            devLog('ChatRoom', '🔥 new_message event received:', data);
            updateDebugInfo('lastEvent', `new_message at ${new Date().toISOString()}`);
            handleNewMessage(data);
        });

        socket.on('message_sent', (data) => {
            devLog('ChatRoom', '🔥 message_sent event received:', data);
            updateDebugInfo('lastEvent', `message_sent at ${new Date().toISOString()}`);
            handleMessageSent(data);
        });

        socket.on('user_typing', (data) => {
            devLog('ChatRoom', '🔥 user_typing event received:', data);
            updateDebugInfo('lastEvent', `user_typing at ${new Date().toISOString()}`);
            handleUserTyping(data);
        });

        socket.on('room_users', (data) => {
            devLog('ChatRoom', '🔥 room_users event received:', data);
            updateDebugInfo('lastEvent', `room_users at ${new Date().toISOString()}`);
            handleRoomUsers(data);
        });

        // Also listen for any event for debugging
        socket.onAny((eventName, ...args) => {
            devLog('ChatRoom', `📡 Socket event: ${eventName}`, args);
            updateDebugInfo('lastAnyEvent', `${eventName} at ${new Date().toISOString()}`);
            
            // Handle any message-like events
            if (eventName.includes('message') && eventName !== 'disconnect') {
                devLog('ChatRoom', `🔴 MESSAGE EVENT DETECTED: ${eventName}`, args);
                
                // Try to handle as new message
                if (args[0] && (args[0].message || args[0].content)) {
                    handleNewMessage(args[0]);
                }
            }
        });
    };

    const cleanupSocketListeners = () => {
        const socket = socketService.socket;
        if (!socket) return;

        socket.off('new_message');
        socket.off('message_sent');
        socket.off('user_typing');
        socket.off('room_users');
        socket.offAny();
    };

    const handleNewMessage = useCallback((data) => {
        devLog('ChatRoom', '🔴 NEW MESSAGE RECEIVED', {
            messageId: data?._id,
            roomId: data?.roomId,
            currentRoomId: roomId,
            timestamp: new Date().toISOString(),
        });
        
        // Validate message structure
        if (!data?._id || !data?.sender || data?.content === undefined) {
            devLog('ChatRoom', 'Invalid message structure, skipping');
            return;
        }
        
        // Check if message is for this room
        const messageRoomId = String(data.roomId || data.room || '');
        const currentRoomId = String(roomId);
        
        if (messageRoomId && messageRoomId !== currentRoomId) {
            devLog('ChatRoom', 'Message for different room', {
                messageRoom: messageRoomId,
                currentRoom: currentRoomId
            });
            return;
        }
        
        setMessages((prev) => {
            // Remove any temporary messages with same content from same sender
            const filteredPrev = prev.filter(msg => {
                if (msg._id.startsWith('temp-') && 
                    msg.content === data.content && 
                    msg.sender._id === data.sender._id) {
                    devLog('ChatRoom', 'Removing optimistic message');
                    return false;
                }
                return true;
            });
            
            // Check if message already exists
            if (filteredPrev.some(msg => msg._id === data._id)) {
                devLog('ChatRoom', 'Message already exists, skipping');
                return filteredPrev;
            }
            
            devLog('ChatRoom', '✅ Adding new message', {
                messageId: data._id,
                content: data.content?.substring(0, 30) + '...'
            });
            
            // Add message and sort by createdAt
            return [...filteredPrev, data].sort((a, b) => 
                new Date(a.createdAt) - new Date(b.createdAt)
            );
        });
        
        // Scroll to bottom
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [roomId]);
    
    const handleMessageSent = useCallback((data) => {
        devLog('ChatRoom', 'Message sent confirmation:', data);
        updateDebugInfo('lastMessageSent', new Date().toISOString());
    }, []);

    const handleMessageDeleted = useCallback(({ messageId }) => {
        setMessages((prev) =>
            prev.map((msg) => (msg._id === messageId ? { ...msg, deleted: true } : msg)),
        );
    }, []);

    const handleUserTyping = useCallback(({ userId, isTyping }) => {
        setTypingUsers((prev) => {
            if (isTyping) {
                return prev.includes(userId) ? prev : [...prev, userId];
            } else {
                return prev.filter((id) => id !== userId);
            }
        });
    }, []);

    const handleRoomUsers = useCallback((users) => {
        // Handle online users if needed
        devLog('ChatRoom', 'Room users update:', users);
    }, []);

    const sendMessage = async () => {
        if (!inputText.trim() || sending) return;

        const messageText = inputText.trim();
        setInputText('');
        setSending(true);

        try {
            devLog('ChatRoom', 'Sending message via API...');
            
            // Optimistically add message to UI (like personal chat does)
            const optimisticMessage = {
                _id: `temp-${Date.now()}`,
                content: messageText,
                sender: {
                    _id: user._id,
                    name: user.name,
                    email: user.email
                },
                roomId: roomId,
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
                    return [...filtered, sentMessage];
                }
                return filtered;
            });
            
            devLog('ChatRoom', 'Message sent successfully:', sentMessage);
            updateDebugInfo('lastMessageSentId', sentMessage._id);
            
            // Force immediate polling check after sending
            setTimeout(() => {
                devLog('ChatRoom', 'Force checking for new messages after send');
                fetchLatestMessages().then(handlePolledMessages);
            }, 500);
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
                        <TouchableOpacity onPress={initializeChat}>
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
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
                    refreshing={refreshing}
                    onRefresh={refreshMessages}
                    inverted={false}
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

export default React.memo(ChatRoomScreen);