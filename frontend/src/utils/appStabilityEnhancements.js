/**
 * App Stability Enhancements
 * Comprehensive improvements for API connection and app stability
 */

import NetInfo from '@react-native-community/netinfo';

import apiClient from '../services/api/client';
import realtimeService from '../services/realtimeService';
import socketService from '../services/socketService';

import { devLog, devError } from './devLog';

class AppStabilityManager {
    constructor() {
        this.isOnline = true;
        this.connectionQuality = 'good';
        this.apiHealth = { success: 0, failure: 0, latency: [] };
        this.socketReconnectAttempts = 0;
        this.maxSocketReconnectAttempts = 10;
        this.healthCheckInterval = null;
        this.networkListener = null;
    }

    /**
     * Initialize stability monitoring
     */
    initialize() {
        devLog('AppStability', 'Initializing stability monitoring');
        
        // Monitor network connectivity
        this.setupNetworkMonitoring();
        
        // Monitor API health
        this.startHealthChecks();
        
        // Setup error boundaries
        this.setupGlobalErrorHandling();
        
        // Monitor socket stability
        this.monitorSocketConnection();
        
        // Setup performance monitoring
        this.setupPerformanceMonitoring();
    }

    /**
     * Network monitoring
     */
    setupNetworkMonitoring() {
        this.networkListener = NetInfo.addEventListener(state => {
            const wasOnline = this.isOnline;
            this.isOnline = state.isConnected && state.isInternetReachable;
            
            devLog('AppStability', 'Network state changed:', {
                isOnline: this.isOnline,
                type: state.type,
                details: state.details,
            });
            
            // Handle connection changes
            if (!wasOnline && this.isOnline) {
                devLog('AppStability', 'Connection restored, syncing data...');
                this.onConnectionRestored();
            } else if (wasOnline && !this.isOnline) {
                devLog('AppStability', 'Connection lost');
                this.onConnectionLost();
            }
            
            // Update connection quality
            this.updateConnectionQuality(state);
        });
    }

    /**
     * Update connection quality based on network state
     */
    updateConnectionQuality(state) {
        if (!state.isConnected) {
            this.connectionQuality = 'offline';
        } else if (state.type === 'wifi') {
            this.connectionQuality = 'good';
        } else if (state.type === 'cellular') {
            const effectiveType = state.details?.cellularGeneration;
            if (effectiveType === '4g' || effectiveType === '5g') {
                this.connectionQuality = 'good';
            } else if (effectiveType === '3g') {
                this.connectionQuality = 'fair';
            } else {
                this.connectionQuality = 'poor';
            }
        } else {
            this.connectionQuality = 'unknown';
        }
        
        devLog('AppStability', `Connection quality: ${this.connectionQuality}`);
    }

    /**
     * Handle connection restored
     */
    async onConnectionRestored() {
        // Clear all API cache to get fresh data
        apiClient.clearAllCache();
        
        // Reconnect socket if needed
        if (!socketService.isConnected()) {
            this.socketReconnectAttempts = 0;
            await this.reconnectSocket();
        }
        
        // Trigger data refresh in screens
        this.emit('connection_restored');
    }

    /**
     * Handle connection lost
     */
    onConnectionLost() {
        // Notify screens about offline state
        this.emit('connection_lost');
    }

    /**
     * Reconnect socket with exponential backoff
     */
    async reconnectSocket() {
        if (this.socketReconnectAttempts >= this.maxSocketReconnectAttempts) {
            devError('AppStability', 'Max socket reconnection attempts reached');
            return;
        }
        
        this.socketReconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.socketReconnectAttempts - 1), 30000);
        
        devLog('AppStability', `Attempting socket reconnection (${this.socketReconnectAttempts}/${this.maxSocketReconnectAttempts}) in ${delay}ms`);
        
        setTimeout(async () => {
            if (this.isOnline && !socketService.isConnected()) {
                try {
                    await socketService.forceReconnect();
                    this.socketReconnectAttempts = 0;
                    devLog('AppStability', 'Socket reconnected successfully');
                } catch (error) {
                    devError('AppStability', 'Socket reconnection failed:', error);
                    this.reconnectSocket(); // Retry
                }
            }
        }, delay);
    }

    /**
     * Monitor socket connection stability
     */
    monitorSocketConnection() {
        // Check socket health every 30 seconds
        setInterval(() => {
            const realtimeStatus = realtimeService.getStatus();
            
            if (realtimeStatus.mode === 'none' && this.isOnline) {
                devLog('AppStability', 'Real-time connection lost, attempting recovery...');
                this.reconnectSocket();
            }
            
            // Log connection mode for debugging
            if (__DEV__) {
                devLog('AppStability', 'Real-time status:', realtimeStatus);
            }
        }, 30000);
    }

    /**
     * Start API health checks
     */
    startHealthChecks() {
        // Initial health check
        this.checkAPIHealth();
        
        // Regular health checks every minute
        this.healthCheckInterval = setInterval(() => {
            this.checkAPIHealth();
        }, 60000);
    }

    /**
     * Check API health
     */
    async checkAPIHealth() {
        const start = Date.now();
        
        try {
            const response = await fetch(`${apiClient.defaults.baseURL}/health`, {
                method: 'GET',
                timeout: 5000,
            });
            
            const latency = Date.now() - start;
            this.apiHealth.latency.push(latency);
            
            if (this.apiHealth.latency.length > 10) {
                this.apiHealth.latency.shift(); // Keep last 10 measurements
            }
            
            if (response.ok) {
                this.apiHealth.success++;
                devLog('AppStability', `API health check passed (${latency}ms)`);
            } else {
                this.apiHealth.failure++;
                devError('AppStability', `API health check failed: ${response.status}`);
            }
        } catch (error) {
            this.apiHealth.failure++;
            devError('AppStability', 'API health check error:', error.message);
        }
        
        // Calculate average latency
        const avgLatency = this.apiHealth.latency.reduce((a, b) => a + b, 0) / this.apiHealth.latency.length;
        
        // Warn if API is slow or unreliable
        if (avgLatency > 3000) {
            devLog('AppStability', `⚠️ API is slow (avg ${Math.round(avgLatency)}ms)`);
        }
        
        const successRate = this.apiHealth.success / (this.apiHealth.success + this.apiHealth.failure);
        if (successRate < 0.9) {
            devLog('AppStability', `⚠️ API reliability issues (${Math.round(successRate * 100)}% success rate)`);
        }
    }

    /**
     * Setup global error handling
     */
    setupGlobalErrorHandling() {
        // Handle unhandled promise rejections
        const originalHandler = global.onunhandledrejection;
        global.onunhandledrejection = (event) => {
            devError('AppStability', 'Unhandled promise rejection:', event);
            
            // Check if it's a network error
            if (event.reason?.message?.includes('Network') || 
                event.reason?.message?.includes('fetch')) {
                this.handleNetworkError(event.reason);
            }
            
            // Call original handler if exists
            if (originalHandler) {
                originalHandler(event);
            }
        };
    }

    /**
     * Handle network errors gracefully
     */
    handleNetworkError(error) {
        devLog('AppStability', 'Handling network error:', error.message);
        
        // Don't spam the user with alerts
        if (!this.lastNetworkErrorTime || Date.now() - this.lastNetworkErrorTime > 10000) {
            this.lastNetworkErrorTime = Date.now();
            this.emit('network_error', error);
        }
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor JS frame rate
        let lastFrameTime = Date.now();
        let frameCount = 0;
        
        const measureFrameRate = () => {
            frameCount++;
            const now = Date.now();
            
            if (now - lastFrameTime >= 1000) {
                const fps = frameCount;
                frameCount = 0;
                lastFrameTime = now;
                
                if (fps < 30) {
                    devLog('AppStability', `⚠️ Low frame rate: ${fps} FPS`);
                }
            }
            
            requestAnimationFrame(measureFrameRate);
        };
        
        if (__DEV__) {
            requestAnimationFrame(measureFrameRate);
        }
    }

    /**
     * Get stability status
     */
    getStatus() {
        const avgLatency = this.apiHealth.latency.reduce((a, b) => a + b, 0) / (this.apiHealth.latency.length || 1);
        const successRate = this.apiHealth.success / (this.apiHealth.success + this.apiHealth.failure || 1);
        
        return {
            isOnline: this.isOnline,
            connectionQuality: this.connectionQuality,
            apiHealth: {
                avgLatency: Math.round(avgLatency),
                successRate: Math.round(successRate * 100),
                totalRequests: this.apiHealth.success + this.apiHealth.failure,
            },
            socketStatus: socketService.isConnected() ? 'connected' : 'disconnected',
            realtimeMode: realtimeService.getStatus().mode,
        };
    }

    /**
     * Event emitter functionality
     */
    listeners = new Map();
    
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        
        return () => {
            this.listeners.get(event)?.delete(callback);
        };
    }
    
    emit(event, data) {
        this.listeners.get(event)?.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                devError('AppStability', `Error in ${event} listener:`, error);
            }
        });
    }

    /**
     * Cleanup
     */
    cleanup() {
        if (this.networkListener) {
            this.networkListener();
        }
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        this.listeners.clear();
    }
}

// Create singleton instance
const appStabilityManager = new AppStabilityManager();

// Export for debugging
if (__DEV__) {
    global.appStabilityManager = appStabilityManager;
}

export default appStabilityManager;