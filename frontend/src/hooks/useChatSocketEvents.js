/**
 * Hook for managing chat socket events
 * Simplifies the socket event registration and cleanup
 */

import { useEffect, useCallback } from 'react';

import socketService from '../services/socketService';
import { devLog } from '../utils';
import socketEventManager from '../utils/socketEventManager';

export const useChatSocketEvents = (roomId, handlers) => {
    const { onNewMessage, onUserTyping, onRoomUsers } = handlers;

    // Join room when connected
    useEffect(() => {
        if (!roomId) return;

        const joinRoom = () => {
            if (socketService.isConnected()) {
                socketService.joinRoom(roomId);
                devLog('ChatSocket', `Joined room: ${roomId}`);
            }
        };

        // Join immediately if connected
        joinRoom();

        // Also join when connection is established
        const handleConnect = () => joinRoom();
        socketService.on('authenticated', handleConnect);

        return () => {
            if (socketService.isConnected()) {
                socketService.leaveRoom(roomId);
                devLog('ChatSocket', `Left room: ${roomId}`);
            }
            socketService.off('authenticated', handleConnect);
        };
    }, [roomId]);

    // Handle new messages
    useEffect(() => {
        if (!onNewMessage || !roomId) return;

        // Register with socketEventManager (handles global events)
        const unsubscribeManager = socketEventManager.on('new_message', (data) => {
            devLog('ChatSocket', 'New message from event manager:', data);
            if (data.roomId === roomId) {
                onNewMessage(data);
            }
        });

        // Also register directly with socket (as backup)
        const handleDirectMessage = (data) => {
            devLog('ChatSocket', 'New message from direct socket:', data);
            if (data.roomId === roomId) {
                onNewMessage(data);
            }
        };
        
        socketService.on('new_message', handleDirectMessage);

        return () => {
            unsubscribeManager();
            socketService.off('new_message', handleDirectMessage);
        };
    }, [roomId, onNewMessage]);

    // Handle typing indicators
    useEffect(() => {
        if (!onUserTyping || !roomId) return;

        const handleTyping = (data) => {
            if (data.roomId === roomId) {
                onUserTyping(data);
            }
        };

        socketService.on('user_typing', handleTyping);

        return () => {
            socketService.off('user_typing', handleTyping);
        };
    }, [roomId, onUserTyping]);

    // Handle room users
    useEffect(() => {
        if (!onRoomUsers || !roomId) return;

        socketService.on('room_users', onRoomUsers);

        return () => {
            socketService.off('room_users', onRoomUsers);
        };
    }, [roomId, onRoomUsers]);

    // Typing helper
    const sendTyping = useCallback((isTyping) => {
        if (socketService.isConnected() && roomId) {
            socketService.typing(roomId, isTyping);
        }
    }, [roomId]);

    return { sendTyping };
};