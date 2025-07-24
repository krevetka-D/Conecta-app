/**
 * Force Real-time Update Utility
 * 
 * This utility ensures messages are properly updated in the chat room
 * by polling for new messages periodically when socket updates fail
 */

import { devLog } from './devLog';

export class ForceRealtimeUpdater {
    constructor() {
        this.intervals = new Map();
        this.callbacks = new Map();
    }

    /**
     * Start polling for a specific room
     * @param {string} roomId - The room ID to poll
     * @param {Function} fetchMessages - Function to fetch messages
     * @param {Function} onNewMessages - Callback when new messages are found
     * @param {number} interval - Polling interval in ms (default 2000ms)
     */
    startPolling(roomId, fetchMessages, onNewMessages, interval = 2000) {
        // Stop existing polling for this room
        this.stopPolling(roomId);

        devLog('ForceRealtimeUpdater', `Starting polling for room ${roomId} every ${interval}ms`);

        // Store the callback
        this.callbacks.set(roomId, { fetchMessages, onNewMessages });

        // Set up the interval
        const intervalId = setInterval(async () => {
            try {
                const messages = await fetchMessages();
                if (messages && messages.length > 0) {
                    onNewMessages(messages);
                }
            } catch (error) {
                devLog('ForceRealtimeUpdater', `Error polling room ${roomId}:`, error);
            }
        }, interval);

        this.intervals.set(roomId, intervalId);
    }

    /**
     * Stop polling for a specific room
     * @param {string} roomId - The room ID to stop polling
     */
    stopPolling(roomId) {
        const intervalId = this.intervals.get(roomId);
        if (intervalId) {
            clearInterval(intervalId);
            this.intervals.delete(roomId);
            this.callbacks.delete(roomId);
            devLog('ForceRealtimeUpdater', `Stopped polling for room ${roomId}`);
        }
    }

    /**
     * Stop all polling
     */
    stopAll() {
        this.intervals.forEach((intervalId, roomId) => {
            clearInterval(intervalId);
            devLog('ForceRealtimeUpdater', `Stopped polling for room ${roomId}`);
        });
        this.intervals.clear();
        this.callbacks.clear();
    }

    /**
     * Force an immediate update for a room
     * @param {string} roomId - The room ID to update
     */
    async forceUpdate(roomId) {
        const callback = this.callbacks.get(roomId);
        if (callback) {
            try {
                const messages = await callback.fetchMessages();
                if (messages && messages.length > 0) {
                    callback.onNewMessages(messages);
                }
            } catch (error) {
                devLog('ForceRealtimeUpdater', `Error forcing update for room ${roomId}:`, error);
            }
        }
    }
}

// Create a singleton instance
export const forceRealtimeUpdater = new ForceRealtimeUpdater();

// Export a simple hook-like interface
export const useForceRealtimeUpdate = (roomId, fetchMessages, onNewMessages, options = {}) => {
    const { enabled = true, interval = 2000 } = options;

    // Start polling when enabled
    if (enabled && roomId && fetchMessages && onNewMessages) {
        forceRealtimeUpdater.startPolling(roomId, fetchMessages, onNewMessages, interval);
    }

    // Return cleanup function
    return () => {
        if (roomId) {
            forceRealtimeUpdater.stopPolling(roomId);
        }
    };
};