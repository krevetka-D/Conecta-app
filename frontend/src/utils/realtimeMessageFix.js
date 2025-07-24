/**
 * Real-time Message Fix
 * Ensures messages are received in real-time by setting up multiple fallback listeners
 */

import socketService from '../services/socketService';

import { devLog, devError } from './devLog';

export function setupRealtimeMessageListener(roomId, onMessageReceived) {
    devLog('RealtimeMessageFix', '🔧 Setting up real-time message listeners', { roomId });
    
    const cleanupFunctions = [];
    
    try {
        // Method 1: Direct socket listener
        if (socketService.socket) {
            const directHandler = (data) => {
                devLog('RealtimeMessageFix', '📨 Direct socket received new_message', data);
                
                // Check if message is for this room
                const messageRoomId = data?.roomId || data?.message?.roomId || data?.message?.room;
                if (messageRoomId === roomId) {
                    onMessageReceived(data);
                }
            };
            
            socketService.socket.on('new_message', directHandler);
            cleanupFunctions.push(() => socketService.socket.off('new_message', directHandler));
            
            devLog('RealtimeMessageFix', '✅ Direct socket listener added');
        }
        
        // Method 2: Socket service listener
        const serviceHandler = (data) => {
            devLog('RealtimeMessageFix', '📨 Service listener received new_message', data);
            
            // Check if message is for this room
            const messageRoomId = data?.roomId || data?.message?.roomId || data?.message?.room;
            if (messageRoomId === roomId) {
                onMessageReceived(data);
            }
        };
        
        socketService.on('new_message', serviceHandler);
        cleanupFunctions.push(() => socketService.off('new_message', serviceHandler));
        
        devLog('RealtimeMessageFix', '✅ Service listener added');
        
        // Method 3: Catch-all listener for debugging
        if (socketService.socket) {
            const catchAllHandler = (eventName, ...args) => {
                if (eventName === 'new_message' || eventName.includes('message')) {
                    devLog('RealtimeMessageFix', `🎯 Catch-all received ${eventName}`, args);
                    
                    // Try to extract and process message
                    const data = args[0];
                    const messageRoomId = data?.roomId || data?.message?.roomId || data?.message?.room;
                    if (messageRoomId === roomId && eventName === 'new_message') {
                        onMessageReceived(data);
                    }
                }
            };
            
            socketService.socket.onAny(catchAllHandler);
            cleanupFunctions.push(() => socketService.socket.offAny(catchAllHandler));
            
            devLog('RealtimeMessageFix', '✅ Catch-all listener added');
        }
        
        // Method 4: Poll for socket readiness and re-attach if needed
        let pollCount = 0;
        const pollInterval = setInterval(() => {
            pollCount++;
            
            if (socketService.socket && socketService.isAuthenticated) {
                // Check if listeners are still attached
                const hasListeners = socketService.socket.listeners('new_message').length > 0;
                
                if (!hasListeners && pollCount < 10) {
                    devLog('RealtimeMessageFix', '⚠️ No listeners found, re-attaching...');
                    
                    // Re-attach direct listener
                    const reattachHandler = (data) => {
                        devLog('RealtimeMessageFix', '📨 Re-attached listener received', data);
                        const messageRoomId = data?.roomId || data?.message?.roomId || data?.message?.room;
                        if (messageRoomId === roomId) {
                            onMessageReceived(data);
                        }
                    };
                    
                    socketService.socket.on('new_message', reattachHandler);
                    cleanupFunctions.push(() => socketService.socket.off('new_message', reattachHandler));
                }
                
                if (pollCount >= 10) {
                    clearInterval(pollInterval);
                }
            }
        }, 1000);
        
        cleanupFunctions.push(() => clearInterval(pollInterval));
        
    } catch (error) {
        devError('RealtimeMessageFix', 'Error setting up listeners', error);
    }
    
    // Return cleanup function
    return () => {
        devLog('RealtimeMessageFix', '🧹 Cleaning up real-time message listeners');
        cleanupFunctions.forEach(cleanup => {
            try {
                cleanup();
            } catch (error) {
                devError('RealtimeMessageFix', 'Error during cleanup', error);
            }
        });
    };
}

// Helper to manually trigger a test message event
export function testMessageReception(roomId, testMessage) {
    devLog('RealtimeMessageFix', '🧪 Testing message reception');
    
    if (socketService.socket) {
        // Simulate receiving a message
        const testData = {
            roomId,
            message: {
                _id: `test_${Date.now()}`,
                roomId,
                content: testMessage || 'Test message',
                sender: {
                    _id: 'test_sender',
                    name: 'Test User',
                },
                createdAt: new Date().toISOString(),
            },
            timestamp: new Date(),
        };
        
        // Emit on the socket to test reception
        socketService.socket.emit('new_message', testData);
        devLog('RealtimeMessageFix', '✅ Test message emitted');
    } else {
        devLog('RealtimeMessageFix', '❌ No socket available for test');
    }
}