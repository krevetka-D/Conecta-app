/**
 * Socket Debugger - Tool to debug socket connection and message flow
 */

import socketService from '../services/socketService';

import { devLog } from './devLog';

export class SocketDebugger {
    constructor() {
        this.events = [];
        this.messageEvents = [];
        this.startTime = Date.now();
    }

    start(roomId) {
        devLog('SocketDebugger', '🔍 Starting socket debugging for room:', roomId);
        
        // Check socket state
        this.logSocketState();
        
        // Monitor all socket events
        if (socketService.socket) {
            socketService.socket.onAny((eventName, ...args) => {
                const event = {
                    time: Date.now() - this.startTime,
                    eventName,
                    args,
                    timestamp: new Date().toISOString(),
                };
                
                this.events.push(event);
                
                // Special tracking for message events
                if (eventName === 'new_message' || eventName.includes('message')) {
                    this.messageEvents.push(event);
                    devLog('SocketDebugger', '🔴 MESSAGE EVENT CAPTURED', event);
                }
                
                // Log in real-time
                devLog('SocketDebugger', `📡 Event: ${eventName}`, {
                    time: `${event.time}ms`,
                    args: args,
                });
            });
        }
        
        // Monitor socket state changes
        this.monitorConnectionState();
        
        // Return stop function
        return () => this.stop();
    }
    
    logSocketState() {
        const state = {
            socketExists: !!socketService.socket,
            connected: socketService.socket?.connected,
            authenticated: socketService.isAuthenticated,
            socketId: socketService.socket?.id,
            connectionState: socketService.getConnectionState(),
        };
        
        devLog('SocketDebugger', '📊 Socket State:', state);
        return state;
    }
    
    monitorConnectionState() {
        // Check state every second
        this.stateInterval = setInterval(() => {
            const state = this.logSocketState();
            
            // Alert if disconnected
            if (!state.connected || !state.authenticated) {
                devLog('SocketDebugger', '⚠️ Socket not fully connected!', state);
            }
        }, 1000);
    }
    
    stop() {
        if (this.stateInterval) {
            clearInterval(this.stateInterval);
        }
        
        // Generate report
        this.generateReport();
    }
    
    generateReport() {
        devLog('SocketDebugger', '📋 Debug Report:', {
            totalEvents: this.events.length,
            messageEvents: this.messageEvents.length,
            duration: `${Date.now() - this.startTime}ms`,
            events: this.events,
            messageEventDetails: this.messageEvents,
        });
    }
    
    // Test sending a message
    async testSendMessage(roomId, content = 'Test message from debugger') {
        devLog('SocketDebugger', '🧪 Testing message send...');
        
        const state = this.logSocketState();
        if (!state.connected || !state.authenticated) {
            devLog('SocketDebugger', '❌ Cannot test - socket not ready', state);
            return;
        }
        
        // Try direct socket emit
        socketService.socket.emit('sendMessage', {
            roomId,
            content,
            type: 'text',
            attachments: [],
        });
        
        devLog('SocketDebugger', '✅ Test message emitted');
    }
    
    // Get current debugging info
    getDebugInfo() {
        return {
            socketState: this.logSocketState(),
            eventCount: this.events.length,
            messageEventCount: this.messageEvents.length,
            lastEvent: this.events[this.events.length - 1],
            lastMessageEvent: this.messageEvents[this.messageEvents.length - 1],
            uptime: `${Date.now() - this.startTime}ms`,
        };
    }
}

// Export singleton instance
export const socketDebugger = new SocketDebugger();

// Attach to window for easy access in development
if (__DEV__ && typeof window !== 'undefined') {
    window.socketDebugger = socketDebugger;
}