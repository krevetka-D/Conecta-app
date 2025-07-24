import { useEffect, useCallback, useRef } from 'react';

import socketService from '../services/socketService';
import { devLog } from '../utils/devLog';

/**
 * Hook to manage socket event listeners with automatic cleanup
 * @param {Object} eventHandlers - Object mapping event names to handler functions
 * @param {Array} deps - Dependencies array for the effect
 */
export const useSocketEvents = (eventHandlers = {}, deps = []) => {
    const handlersRef = useRef(eventHandlers);
    
    // Update handlers ref when they change
    useEffect(() => {
        handlersRef.current = eventHandlers;
    }, [eventHandlers]);

    useEffect(() => {
        if (!socketService) {
            devLog('useSocketEvents', 'Socket service not available');
            return;
        }

        // Create stable handlers that reference the latest handlers
        const stableHandlers = {};
        
        Object.entries(eventHandlers).forEach(([event, handler]) => {
            stableHandlers[event] = (...args) => {
                const currentHandler = handlersRef.current[event];
                if (currentHandler) {
                    currentHandler(...args);
                }
            };
        });

        // Register all event listeners
        Object.entries(stableHandlers).forEach(([event, handler]) => {
            devLog('useSocketEvents', `Registering listener for: ${event}`);
            socketService.on(event, handler);
        });

        // Cleanup function
        return () => {
            Object.entries(stableHandlers).forEach(([event, handler]) => {
                devLog('useSocketEvents', `Removing listener for: ${event}`);
                socketService.off(event, handler);
            });
        };
    }, deps); // Only re-register if deps change
    
    // Return socket connection state
    const isConnected = socketService.isConnected();
    
    return { isConnected };
};