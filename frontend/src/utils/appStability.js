// frontend/src/utils/appStability.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import React from 'react';
import { AppState, Platform } from 'react-native';

import socketService from '../services/socketService';

import { cache } from './cacheManager';


class AppStabilityEnhancer {
    constructor() {
        this.appState = AppState.currentState;
        this.networkState = null;
        this.memoryWarningListeners = [];
        this.crashRecoveryData = {};
        this.performanceMetrics = {
            renderCounts: {},
            apiCallDurations: [],
            memoryWarnings: 0,
        };

        // Store subscriptions for cleanup
        this.appStateSubscription = null;
        this.networkSubscription = null;

        this.initialize();
    }

    async initialize() {
        // Setup app state listener
        this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);

        // Setup network monitoring
        this.networkSubscription = NetInfo.addEventListener(this.handleNetworkChange);

        // Setup memory warning listener (iOS)
        if (Platform.OS === 'ios') {
            const { NativeEventEmitter, NativeModules } = require('react-native');
            const { MemoryWarning } = NativeModules;

            if (MemoryWarning) {
                const memoryWarningEmitter = new NativeEventEmitter(MemoryWarning);
                memoryWarningEmitter.addListener('memoryWarning', this.handleMemoryWarning);
            }
        }

        // Restore crash recovery data
        await this.restoreCrashRecoveryData();

        // Setup periodic health checks
        this.startHealthChecks();
    }

    handleAppStateChange = async (nextAppState) => {
        // App is going to background
        if (this.appState === 'active' && nextAppState.match(/inactive|background/)) {
            await this.onAppBackground();
        }

        // App is coming to foreground
        if (this.appState.match(/inactive|background/) && nextAppState === 'active') {
            await this.onAppForeground();
        }

        this.appState = nextAppState;
    };

    handleNetworkChange = async (state) => {
        const wasOffline = this.networkState && !this.networkState.isConnected;
        const isNowOnline = state.isConnected;

        this.networkState = state;

        // Network restored
        if (wasOffline && isNowOnline) {
            console.log('Network restored');
            await this.onNetworkRestored();
        }

        // Network lost
        if (!wasOffline && !isNowOnline) {
            console.log('Network lost');
            await this.onNetworkLost();
        }
    };

    handleMemoryWarning = () => {
        console.warn('Memory warning received');
        this.performanceMetrics.memoryWarnings++;

        // Clear caches
        cache.clear();

        // Notify listeners
        this.memoryWarningListeners.forEach((listener) => {
            try {
                listener();
            } catch (error) {
                console.error('Error in memory warning listener:', error);
            }
        });

        // Force garbage collection if available
        if (global.gc) {
            global.gc();
        }
    };

    async onAppBackground() {
        // Save app state
        await this.saveCrashRecoveryData();

        // Clear unnecessary caches
        const cacheStats = cache.getStats();
        if (cacheStats.estimatedSize > 5 * 1024 * 1024) {
            // 5MB
            await cache.clear();
        }

        // Disconnect socket to save battery
        socketService.disconnect();

        // Save performance metrics
        await this.savePerformanceMetrics();
    }

    async onAppForeground() {
        // Reconnect socket if user is authenticated
        const token = await AsyncStorage.getItem('userToken');
        const user = await AsyncStorage.getItem('user');

        if (token && user) {
            try {
                const userData = JSON.parse(user);
                await socketService.connect(userData._id);
            } catch (error) {
                console.error('Failed to reconnect socket:', error);
            }
        }

        // Refresh critical data
        await this.refreshCriticalData();

        // Check for app updates
        await this.checkForUpdates();
    }

    async onNetworkRestored() {
        // Process queued requests
        if (global.requestQueue) {
            global.requestQueue.process();
        }

        // Reconnect socket
        const user = await AsyncStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                await socketService.connect(userData._id);
            } catch (error) {
                console.error('Failed to reconnect socket:', error);
            }
        }

        // Refresh stale data
        await this.refreshStaleData();
    }

    async onNetworkLost() {
        // Notify user
        if (global.showNetworkAlert) {
            global.showNetworkAlert('You are offline', 'Some features may be limited');
        }
    }

    async saveCrashRecoveryData() {
        try {
            const recoveryData = {
                timestamp: Date.now(),
                currentRoute: global.currentRoute,
                userToken: await AsyncStorage.getItem('userToken'),
                ...this.crashRecoveryData,
            };

            await AsyncStorage.setItem('crash_recovery', JSON.stringify(recoveryData));
        } catch (error) {
            console.error('Failed to save crash recovery data:', error);
        }
    }

    async restoreCrashRecoveryData() {
        try {
            const stored = await AsyncStorage.getItem('crash_recovery');
            if (stored) {
                const data = JSON.parse(stored);

                // Check if app crashed recently (within last 5 minutes)
                if (Date.now() - data.timestamp < 5 * 60 * 1000) {
                    this.crashRecoveryData = data;

                    // Notify about crash recovery
                    if (global.onCrashRecovery) {
                        global.onCrashRecovery(data);
                    }
                }

                // Clear old data
                await AsyncStorage.removeItem('crash_recovery');
            }
        } catch (error) {
            console.error('Failed to restore crash recovery data:', error);
        }
    }

    async refreshCriticalData() {
        // Refresh user data
        if (global.refreshUserData) {
            try {
                await global.refreshUserData();
            } catch (error) {
                console.error('Failed to refresh user data:', error);
            }
        }

        // Clear expired cache entries
        cache.cleanup();
    }

    async refreshStaleData() {
        // Invalidate old API cache
        const cacheStats = cache.getStats();
        if (cacheStats.expiredEntries > 10) {
            await cache.invalidatePattern('^api_');
        }
    }

    async checkForUpdates() {
        // TODO: Implement app update check
        // This could check your backend for the latest app version
    }

    async savePerformanceMetrics() {
        try {
            await AsyncStorage.setItem(
                'performance_metrics',
                JSON.stringify(this.performanceMetrics),
            );
        } catch (error) {
            console.error('Failed to save performance metrics:', error);
        }
    }

    startHealthChecks() {
        // Periodic health check every 5 minutes
        setInterval(() => {
            this.performHealthCheck();
        }, 5 * 60 * 1000);
    }

    async performHealthCheck() {
        const health = {
            memoryWarnings: this.performanceMetrics.memoryWarnings,
            networkState: this.networkState,
            cacheStats: cache.getStats(),
            socketConnected: socketService.isConnected(),
            timestamp: Date.now(),
        };

        // Log health status
        if (__DEV__) {
            console.log('App Health Check:', health);
        }

        // Take action if needed
        if (health.memoryWarnings > 5) {
            // Too many memory warnings, clear everything
            await this.emergencyCleanup();
        }

        if (health.cacheStats.estimatedSize > 10 * 1024 * 1024) {
            // 10MB
            // Cache too large
            await cache.clear();
        }
    }

    async emergencyCleanup() {
        console.warn('Performing emergency cleanup');

        // Clear all caches
        await cache.clear();

        // Clear image cache if using FastImage
        try {
            const FastImage = require('react-native-fast-image');
            if (FastImage) {
                await FastImage.clearMemoryCache();
                await FastImage.clearDiskCache();
            }
        } catch (error) {
            // FastImage not available
        }

        // Reset performance metrics
        this.performanceMetrics = {
            renderCounts: {},
            apiCallDurations: [],
            memoryWarnings: 0,
        };

        // Force garbage collection
        if (global.gc) {
            global.gc();
        }
    }

    // Track component renders
    trackRender(componentName) {
        if (!this.performanceMetrics.renderCounts[componentName]) {
            this.performanceMetrics.renderCounts[componentName] = 0;
        }
        this.performanceMetrics.renderCounts[componentName]++;

        // Warn about excessive renders
        if (this.performanceMetrics.renderCounts[componentName] > 100) {
            console.warn(
                `Component ${componentName} has rendered ${this.performanceMetrics.renderCounts[componentName]} times`,
            );
        }
    }

    // Track API call duration
    trackApiCall(url, duration) {
        this.performanceMetrics.apiCallDurations.push({
            url,
            duration,
            timestamp: Date.now(),
        });

        // Keep only last 100 calls
        if (this.performanceMetrics.apiCallDurations.length > 100) {
            this.performanceMetrics.apiCallDurations.shift();
        }

        // Warn about slow API calls
        if (duration > 5000) {
            console.warn(`Slow API call to ${url}: ${duration}ms`);
        }
    }

    // Add memory warning listener
    addMemoryWarningListener(listener) {
        this.memoryWarningListeners.push(listener);

        // Return unsubscribe function
        return () => {
            const index = this.memoryWarningListeners.indexOf(listener);
            if (index > -1) {
                this.memoryWarningListeners.splice(index, 1);
            }
        };
    }

    // Set crash recovery data
    setCrashRecoveryData(key, value) {
        this.crashRecoveryData[key] = value;
    }

    // Get performance report
    getPerformanceReport() {
        const avgApiDuration =
            this.performanceMetrics.apiCallDurations.length > 0
                ? this.performanceMetrics.apiCallDurations.reduce(
                    (sum, call) => sum + call.duration,
                    0,
                ) / this.performanceMetrics.apiCallDurations.length
                : 0;

        const slowApiCalls = this.performanceMetrics.apiCallDurations.filter(
            (call) => call.duration > 3000,
        );

        return {
            renderCounts: this.performanceMetrics.renderCounts,
            avgApiDuration,
            slowApiCalls: slowApiCalls.length,
            memoryWarnings: this.performanceMetrics.memoryWarnings,
            cacheStats: cache.getStats(),
            networkState: this.networkState,
            socketConnected: socketService.isConnected(),
        };
    }

    // Cleanup
    cleanup() {
        // Remove event listeners using the stored subscriptions
        if (this.appStateSubscription && typeof this.appStateSubscription.remove === 'function') {
            this.appStateSubscription.remove();
        }
        if (this.networkSubscription && typeof this.networkSubscription === 'function') {
            this.networkSubscription();
        }
        // Clear intervals and listeners
        if (this.memoryWarningListeners) {
            this.memoryWarningListeners = [];
        }
    }
}

// Create singleton instance
const appStability = new AppStabilityEnhancer();

// Export convenience functions
export const trackRender = (componentName) => appStability.trackRender(componentName);
export const trackApiCall = (url, duration) => appStability.trackApiCall(url, duration);
export const addMemoryWarningListener = (listener) =>
    appStability.addMemoryWarningListener(listener);
export const setCrashRecoveryData = (key, value) => appStability.setCrashRecoveryData(key, value);
export const getPerformanceReport = () => appStability.getPerformanceReport();

// React Hook for tracking component renders
export const useRenderTracking = (componentName) => {
    React.useEffect(() => {
        trackRender(componentName);
    });
};

// React Hook for memory warning handling
export const useMemoryWarning = (callback) => {
    React.useEffect(() => {
        const unsubscribe = addMemoryWarningListener(callback);
        return unsubscribe;
    }, [callback]);
};

export default appStability;
