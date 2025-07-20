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
import { Avatar, Badge } from 'react-native-paper';
import Icon from '../../components/common/Icon.js';
import { format } from 'date-fns';

import { useAuth } from '../../store/contexts/AuthContext';
import { useTheme } from '../../store/contexts/ThemeContext';
import socketService from '../../services/socketService';
import chatService from '../../services/chatService';
import { showErrorAlert } from '../../utils/alerts';
import { chatRoomStyles } from '../../styles/screens/chat/ChatRoomStyles';

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
            socketService.leaveRoom(roomId);
            cleanupSocketListeners();
        };
    }, [roomId]);

    const initializeChat = async () => {
        try {
            // Connect socket if not connected
            if (!socketService.isConnected()) {
                await socketService.connect(user._id);
            }

            // Join the room
            socketService.joinRoom(roomId);

            // Load initial messages
            const initialMessages = await chatService.getRoomMessages(roomId);
            setMessages(initialMessages);

            // Setup socket listeners
            setupSocketListeners();

            setLoading(false);
        } catch (error) {
            console.error('Failed to initialize chat:', error);
            showErrorAlert('Error', 'Failed to load chat');
            setLoading(false);
        }
    };

    const setupSocketListeners = () => {
        // Listen for new messages
        socketService.on('newMessage', handleNewMessage);
        socketService.on('messageDeleted', handleMessageDeleted);
        socketService.on('messageReaction', handleMessageReaction);
        socketService.on('userTyping', handleUserTyping);
        socketService.on('roomUsers', setOnlineUsers);
        socketService.on('userJoinedRoom', handleUserJoined);
        socketService.on('userLeftRoom', handleUserLeft);
        socketService.on('roomMessages', handleRoomMessages);
    };

    const cleanupSocketListeners = () => {
        socketService.off('newMessage', handleNewMessage);
        socketService.off('messageDeleted', handleMessageDeleted);
        socketService.off('messageReaction', handleMessageReaction);
        socketService.off('userTyping', handleUserTyping);
        socketService.off('roomUsers', setOnlineUsers);
        socketService.off('userJoinedRoom', handleUserJoined);
        socketService.off('userLeftRoom', handleUserLeft);
        socketService.off('roomMessages', handleRoomMessages);
    };

    const handleNewMessage = useCallback((message) => {
        setMessages(prev => [...prev, message]);
        // Scroll to bottom
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, []);

    const handleMessageDeleted = useCallback(({ messageId }) => {
        setMessages(prev => prev.map(msg => 
            msg._id === messageId ? { ...msg, deleted: true } : msg
        ));
    }, []);

    const handleMessageReaction = useCallback(({ messageId, reactions }) => {
        setMessages(prev => prev.map(msg => 
            msg._id === messageId ? { ...msg, reactions } : msg
        ));
    }, []);

    const handleUserTyping = useCallback(({ userId, isTyping }) => {
        setTypingUsers(prev => {
            if (isTyping) {
                return [...prev.filter(id => id !== userId), userId];
            } else {
                return prev.filter(id => id !== userId);
            }
        });
    }, []);

    const handleRoomMessages = useCallback((messages) => {
        setMessages(messages);
    }, []);

    const handleUserJoined = useCallback(({ userId }) => {
        // Could show a system message
        console.log('User joined:', userId);
    }, []);

    const handleUserLeft = useCallback(({ userId }) => {
        // Could show a system message
        console.log('User left:', userId);
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
            setInputText(messageText); // Restore input on error
        } finally {
            setSending(false);
        }
    };

    const handleTyping = (text) => {
        setInputText(text);

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Emit typing event
        if (text.trim()) {
            socketService.typing(roomId, true);

            // Stop typing after 3 seconds
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

        if (item.deleted) {
            return (
                <View style={[styles.messageContainer, isOwnMessage && styles.ownMessageContainer]}>
                    <Text style={styles.deletedMessage}>Message deleted</Text>
                </View>
            );
        }

        return (
            <View style={[styles.messageContainer, isOwnMessage && styles.ownMessageContainer]}>
                {showAvatar && !isOwnMessage && (
                    <Avatar.Text
                        size={32}
                        label={item.sender.name.charAt(0)}
                        style={styles.avatar}
                    />
                )}
                
                <View style={[styles.messageBubble, isOwnMessage && styles.ownMessageBubble]}>
                    {!isOwnMessage && showAvatar && (
                        <Text style={styles.senderName}>{item.sender.name}</Text>
                    )}
                    
                    {item.replyTo && (
                        <View style={styles.replyContainer}>
                            <Text style={styles.replyText}>
                                {item.replyTo.sender.name}: {item.replyTo.content}
                            </Text>
                        </View>
                    )}
                    
                    <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText]}>
                        {item.content}
                    </Text>
                    
                    <View style={styles.messageFooter}>
                        <Text style={[styles.messageTime, isOwnMessage && styles.ownMessageTime]}>
                            {format(new Date(item.createdAt), 'HH:mm')}
                        </Text>
                        {isOwnMessage && item.readBy?.length > 1 && (
                            <Icon name="check-all" size={16} color={theme.colors.primary} />
                        )}
                    </View>

                    {item.reactions?.length > 0 && (
                        <View style={styles.reactionsContainer}>
                            {item.reactions.map((reaction, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.reaction}
                                    onPress={() => socketService.addReaction(item._id, reaction.emoji)}
                                >
                                    <Text>{reaction.emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const renderTypingIndicator = () => {
        if (typingUsers.length === 0) return null;

        return (
            <View style={styles.typingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.typingText}>
                    {typingUsers.length === 1 ? 'Someone is typing...' : 'Multiple people are typing...'}
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
                />

                {renderTypingIndicator()}

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={handleTyping}
                        placeholder="Type a message..."
                        multiline
                        maxLength={1000}
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
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default React.memo(ChatRoomScreen);