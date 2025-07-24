import { useState, useEffect, useCallback, useRef } from 'react';

import chatService from '../services/chatService';
import socketService from '../services/socketService';
import { devLog, devError } from '../utils/devLog';

export const useChatRoom = (roomId, userId) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [connectionError, setConnectionError] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const messageCache = useRef(new Set());

    // Initialize chat room
    useEffect(() => {
        let isMounted = true;

        const initializeRoom = async () => {
            try {
                setConnectionError(false);

                // Ensure socket is connected
                if (!socketService.isConnected() && userId) {
                    try {
                        await socketService.connect(userId);
                        devLog('useChatRoom', 'Socket connected successfully');
                    } catch (error) {
                        devError('useChatRoom', 'Socket connection failed', error);
                        setConnectionError(true);
                    }
                }

                // Join room
                if (socketService.isConnected()) {
                    socketService.joinRoom(roomId);
                    devLog('useChatRoom', `Joined room: ${roomId}`);
                }

                // Load initial messages
                const initialMessages = await chatService.getRoomMessages(roomId);
                if (isMounted) {
                    setMessages(initialMessages || []);
                    // Cache message IDs
                    initialMessages?.forEach(msg => messageCache.current.add(msg._id));
                }
            } catch (error) {
                devError('useChatRoom', 'Failed to initialize room', error);
                if (isMounted) {
                    setConnectionError(true);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        initializeRoom();

        return () => {
            isMounted = false;
            if (socketService.isConnected()) {
                socketService.leaveRoom(roomId);
            }
        };
    }, [roomId, userId]);

    // Handle new messages
    const handleNewMessage = useCallback((data) => {
        devLog('useChatRoom', 'New message event:', data);
        
        // Extract message from different possible data structures
        const message = data.message || data;
        
        // Only process if it's for this room
        if (data.roomId === roomId || message.room === roomId || message.roomId === roomId) {
            // Prevent duplicates
            if (!messageCache.current.has(message._id)) {
                messageCache.current.add(message._id);
                setMessages(prev => [...prev, message]);
            }
        }
    }, [roomId]);

    // Handle typing indicators
    const handleUserTyping = useCallback(({ userId, isTyping, roomId: typingRoomId }) => {
        if (typingRoomId === roomId) {
            setTypingUsers(prev => {
                if (isTyping) {
                    return prev.includes(userId) ? prev : [...prev, userId];
                } else {
                    return prev.filter(id => id !== userId);
                }
            });
        }
    }, [roomId]);

    // Setup socket listeners
    useEffect(() => {
        if (!socketService.isConnected()) return;

        devLog('useChatRoom', 'Setting up socket listeners');
        
        socketService.on('new_message', handleNewMessage);
        socketService.on('user_typing', handleUserTyping);

        return () => {
            socketService.off('new_message', handleNewMessage);
            socketService.off('user_typing', handleUserTyping);
        };
    }, [handleNewMessage, handleUserTyping]);

    // Send message
    const sendMessage = useCallback(async (content) => {
        if (!content?.trim()) return;

        try {
            const sentMessage = await chatService.sendMessage(roomId, content.trim());
            devLog('useChatRoom', 'Message sent:', sentMessage);
            return sentMessage;
        } catch (error) {
            devError('useChatRoom', 'Failed to send message', error);
            throw error;
        }
    }, [roomId]);

    // Send typing indicator
    const sendTypingIndicator = useCallback((isTyping) => {
        if (socketService.isConnected()) {
            socketService.typing(roomId, isTyping);
        }
    }, [roomId]);

    return {
        messages,
        loading,
        connectionError,
        typingUsers,
        sendMessage,
        sendTypingIndicator,
        isConnected: socketService.isConnected(),
    };
};