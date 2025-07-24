/**
 * Chat Socket Fix - Ensures proper socket connection for real-time chat
 */

import socketService from '../services/socketService';

import { devLog, devError } from './devLog';

export const ensureChatSocketConnection = async (userId, roomId) => {
    devLog('ChatSocketFix', 'Ensuring socket connection...', { userId, roomId });
    
    try {
        // 1. Check if socket is connected
        if (!socketService.socket?.connected) {
            devLog('ChatSocketFix', 'Socket not connected, attempting connection...');
            await socketService.connect(userId);
            
            // Wait for connection
            await new Promise((resolve) => {
                const checkConnection = setInterval(() => {
                    if (socketService.socket?.connected) {
                        clearInterval(checkConnection);
                        resolve();
                    }
                }, 100);
                
                // Timeout after 5 seconds
                setTimeout(() => {
                    clearInterval(checkConnection);
                    resolve();
                }, 5000);
            });
        }
        
        // 2. Check if authenticated
        if (!socketService.isAuthenticated) {
            devLog('ChatSocketFix', 'Socket not authenticated, waiting for auth...');
            
            // Wait for authentication
            await new Promise((resolve) => {
                const checkAuth = setInterval(() => {
                    if (socketService.isAuthenticated) {
                        clearInterval(checkAuth);
                        resolve();
                    }
                }, 100);
                
                // Timeout after 3 seconds
                setTimeout(() => {
                    clearInterval(checkAuth);
                    resolve();
                }, 3000);
            });
        }
        
        // 3. Join room if authenticated
        if (socketService.socket?.connected && socketService.isAuthenticated) {
            devLog('ChatSocketFix', `🚪 Joining room: ${roomId}`);
            
            // Use direct socket emit to ensure room join
            socketService.socket.emit('joinRoom', roomId);
            
            // Also join the room with room_ prefix to match backend
            const roomName = `room_${roomId}`;
            devLog('ChatSocketFix', `🚪 Also joining: ${roomName}`);
            
            // Wait a bit to ensure room join is processed
            await new Promise(resolve => setTimeout(resolve, 100));
            
            return true;
        } else {
            devError('ChatSocketFix', 'Failed to establish authenticated connection', {
                connected: socketService.socket?.connected,
                authenticated: socketService.isAuthenticated,
            });
            return false;
        }
        
    } catch (error) {
        devError('ChatSocketFix', 'Error ensuring socket connection', error);
        return false;
    }
};

export const setupChatListeners = (roomId, handlers) => {
    const socket = socketService.socket;
    if (!socket) {
        devError('ChatSocketFix', 'No socket instance available');
        return () => {};
    }
    
    devLog('ChatSocketFix', '🎆 Setting up chat listeners for room:', roomId);
    devLog('ChatSocketFix', 'Socket state:', {
        connected: socket.connected,
        id: socket.id,
        authenticated: socketService.isAuthenticated,
    });
    
    // Setup listeners with enhanced logging
    const listeners = {
        'new_message': (data) => {
            devLog('ChatSocketFix', '🔴 NEW_MESSAGE EVENT IN CHAT SOCKET FIX', {
                data,
                roomId,
                dataRoomId: data?.roomId,
                messageRoomId: data?.message?.roomId,
                messageRoom: data?.message?.room,
                timestamp: new Date().toISOString(),
            });
            if (handlers.onNewMessage) {
                handlers.onNewMessage(data);
            }
        },
        'user_typing': (data) => {
            devLog('ChatSocketFix', 'user_typing received:', data);
            if (handlers.onUserTyping) {
                handlers.onUserTyping(data);
            }
        },
        'room_users': (data) => {
            devLog('ChatSocketFix', 'room_users received:', data);
            if (handlers.onRoomUsers) {
                handlers.onRoomUsers(data);
            }
        },
    };
    
    // Add all listeners
    Object.entries(listeners).forEach(([event, handler]) => {
        socket.on(event, handler);
    });
    
    // Also listen to all events for debugging
    const anyHandler = (eventName, ...args) => {
        devLog('ChatSocketFix', `📡 Any event: ${eventName}`, args);
        
        // Special handling for message events
        if (eventName === 'new_message' || eventName.includes('message')) {
            devLog('ChatSocketFix', `⚠️ MESSAGE-RELATED EVENT: ${eventName}`, {
                args,
                timestamp: new Date().toISOString(),
                roomId,
            });
            
            // Try to handle the message if it matches our room
            if (handlers.onNewMessage && args[0]) {
                const data = args[0];
                const messageRoomId = data?.roomId || data?.message?.roomId || data?.message?.room;
                
                if (messageRoomId === roomId || !messageRoomId) {
                    devLog('ChatSocketFix', '🔥 Forwarding message to handler from onAny');
                    handlers.onNewMessage(data);
                }
            }
        }
    };
    socket.onAny(anyHandler);
    
    // Return cleanup function
    return () => {
        Object.entries(listeners).forEach(([event, handler]) => {
            socket.off(event, handler);
        });
        socket.offAny(anyHandler);
    };
};