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
import { format } from 'date-fns';

import { useAuth } from '../../store/contexts/AuthContext';
import { useTheme } from '../../store/contexts/ThemeContext';
import socketService from '../../services/socketService';
import chatService from '../../services/chatService';
import { showErrorAlert } from '../../utils/alerts';
import { chatRoomStyles } from '../../styles/screens/chat/ChatRoomStyles';

const ForumDetailScreen = ({ route, navigation }) => {
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

    const initializeChat = async () => {
        try {
            setConnectionError(false);
            
            // In development with mock mode, skip socket connection
            if (__DEV__ && !socketService.isConnected()) {
                console.log('Development mode: Skipping socket connection, using mock data');
                setConnectionError(false);
                
                // Load initial messages from API/Mock
                try {
                    const initialMessages = await chatService.getRoomMessages(roomId);
                    setMessages(initialMessages || []);
                } catch (error) {
                    console.error('Failed to load messages:', error);
                }
                
                setLoading(false);
                return;
            }
            
            // Production mode or when socket is needed
            if (!socketService.isConnected()) {
                console.log('Attempting to connect socket...');
                try {
                    await socketService.connect(user._id);
                    console.log('Socket connected successfully');
                } catch (error) {
                    console.error('Socket connection failed:', error);
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
                setMessages(initialMessages || []);
            } catch (error) {
                console.error('Failed to load messages:', error);
            }

            setLoading(false);
        } catch (error) {
            console.error('Failed to initialize chat:', error);
            setLoading(false);
            setConnectionError(true);
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
        setMessages(prev => [...prev, message]);
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, []);

    const handleMessageDeleted = useCallback(({ messageId }) => {
        setMessages(prev => prev.map(msg => 
            msg._id === messageId ? { ...msg, deleted: true } : msg
        ));
    }, []);

    const handleUserTyping = useCallback(({ userId, isTyping }) => {
        setTypingUsers(prev => {
            if (isTyping) {
                return prev.includes(userId) ? prev : [...prev, userId];
            } else {
                return prev.filter(id => id !== userId);
            }
        });
    }, []);

    const handleRoomUsers = useCallback((users) => {
        // Handle online users if needed
    }, []);

    const sendMessage = async () => {
        if (!inputText.trim() || sending) return;

        const messageText = inputText.trim();
        setInputText('');
        setSending(true);

        try {
            socketService.sendMessage({
                roomId,
                content: messageText,
                type: 'text'
            });
        } catch (error) {
            console.error('Failed to send message:', error);
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
        const isOwnMessage = item.sender._id === user._id;
        const showAvatar = index === 0 || messages[index - 1]?.sender._id !== item.sender._id;
        
        // Group messages by time (5 minute intervals)
        const showTimestamp = index === 0 || 
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
                            {format(new Date(item.createdAt), 'HH:mm')}
                        </Text>
                    </View>
                )}
                
                <View style={[styles.messageContainer, isOwnMessage && styles.ownMessageContainer]}>
                    {showAvatar && !isOwnMessage && (
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {item.sender.name.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        </View>
                    )}
                    
                    <View style={[
                        styles.messageBubble,
                        isOwnMessage && styles.ownMessageBubble,
                        !showAvatar && !isOwnMessage && styles.messageBubbleWithoutAvatar
                    ]}>
                        {!isOwnMessage && showAvatar && (
                            <Text style={styles.senderName}>{item.sender.name}</Text>
                        )}
                        
                        <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText]}>
                            {item.content}
                        </Text>
                        
                        {isOwnMessage && (
                            <View style={styles.messageStatus}>
                                <Icon 
                                    name={item.readBy?.length > 1 ? "check-all" : "check"} 
                                    size={16} 
                                    color={item.readBy?.length > 1 ? "#60A5FA" : "#FFFFFF99"}
                                />
                            </View>
                        )}
                    </View>
                </View>
            </>
        );
    };

    const renderTypingIndicator = () => {
        if (typingUsers.length === 0) return null;

        return (
            <View style={styles.typingContainer}>
                <View style={styles.typingDots}>
                    <View style={[styles.dot, styles.dot1]} />
                    <View style={[styles.dot, styles.dot2]} />
                    <View style={[styles.dot, styles.dot3]} />
                </View>
                <Text style={styles.typingText}>
                    {typingUsers.length === 1 ? 'Someone is typing' : 'Multiple people are typing'}
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
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    ListFooterComponent={renderTypingIndicator}
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
                            style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
                        >
                            <Icon 
                                name="send" 
                                size={24} 
                                color={inputText.trim() && !sending ? theme.colors.primary : theme.colors.disabled} 
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default React.memo(ChatRoomScreen);