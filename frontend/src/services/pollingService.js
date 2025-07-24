/**
 * Polling Service - Alternative to WebSocket for real-time updates
 * Uses HTTP polling when WebSocket connection fails
 */

import { devLog, devError } from '../utils';

import apiClient from './api/client';

class PollingService {
    constructor() {
        this.pollingIntervals = new Map();
        this.isActive = false;
        this.callbacks = new Map();
    }

    /**
     * Start polling for updates
     */
    start() {
        if (this.isActive) {
            devLog('PollingService', 'Already active');
            return;
        }

        this.isActive = true;
        devLog('PollingService', 'Starting polling service as WebSocket fallback');

        // Poll for different types of updates (endpoints without leading slash)
        this.startPolling('messages', 'chat/updates', 5000); // Every 5 seconds
        this.startPolling('forums', 'forums/updates', 10000); // Every 10 seconds
        this.startPolling('notifications', 'users/notifications', 15000); // Every 15 seconds
    }

    /**
     * Stop all polling
     */
    stop() {
        this.isActive = false;
        this.pollingIntervals.forEach((interval, key) => {
            clearInterval(interval);
            devLog('PollingService', `Stopped polling for ${key}`);
        });
        this.pollingIntervals.clear();
    }

    /**
     * Start polling for a specific endpoint
     */
    startPolling(key, endpoint, interval) {
        // Clear existing interval if any
        if (this.pollingIntervals.has(key)) {
            clearInterval(this.pollingIntervals.get(key));
        }

        const pollFunction = async () => {
            if (!this.isActive) return;

            try {
                const response = await apiClient.get(endpoint, {
                    params: {
                        since: new Date(Date.now() - interval).toISOString(),
                    },
                });

                if (response.data && response.data.updates) {
                    this.processUpdates(key, response.data.updates);
                }
            } catch (error) {
                // Silently handle errors to avoid spamming logs
                if (error.response?.status !== 404) {
                    devError('PollingService', `Error polling ${key}:`, error.message);
                }
            }
        };

        // Initial poll
        pollFunction();

        // Set up interval
        const intervalId = setInterval(pollFunction, interval);
        this.pollingIntervals.set(key, intervalId);
        
        devLog('PollingService', `Started polling ${key} every ${interval}ms`);
    }

    /**
     * Process updates received from polling
     */
    processUpdates(type, updates) {
        if (!updates || updates.length === 0) return;

        devLog('PollingService', `Processing ${updates.length} ${type} updates`);

        // Emit updates to registered callbacks
        updates.forEach(update => {
            const callbacks = this.callbacks.get(update.event) || [];
            callbacks.forEach(callback => {
                try {
                    callback(update.data);
                } catch (error) {
                    devError('PollingService', 'Error in update callback:', error);
                }
            });
        });
    }

    /**
     * Register a callback for specific events
     */
    on(event, callback) {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }
        this.callbacks.get(event).push(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.callbacks.get(event) || [];
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        };
    }

    /**
     * Remove all callbacks for an event
     */
    off(event) {
        this.callbacks.delete(event);
    }

    /**
     * Check if polling is active
     */
    isPollingActive() {
        return this.isActive;
    }

    /**
     * Get polling status
     */
    getStatus() {
        return {
            active: this.isActive,
            endpoints: Array.from(this.pollingIntervals.keys()),
            callbacks: Array.from(this.callbacks.keys()),
        };
    }
}

// Create singleton instance
const pollingService = new PollingService();

export default pollingService;