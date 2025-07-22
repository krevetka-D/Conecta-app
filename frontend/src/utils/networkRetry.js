// frontend/src/utils/networkRetry.js
import NetInfo from '@react-native-community/netinfo';

class NetworkRetryManager {
    constructor() {
        this.retryQueue = [];
        this.isOnline = true;
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.listeners = new Map();
        
        // Start monitoring network status
        this.initNetworkListener();
    }

    initNetworkListener() {
        NetInfo.addEventListener(state => {
            const wasOffline = !this.isOnline;
            this.isOnline = state.isConnected;
            
            if (wasOffline && this.isOnline) {
                console.log('Network restored, processing retry queue');
                this.processRetryQueue();
            }
            
            // Notify listeners
            this.notifyListeners(this.isOnline);
        });
    }

    async executeWithRetry(fn, options = {}) {
        const {
            maxRetries = this.maxRetries,
            retryDelay = this.retryDelay,
            shouldRetry = (error) => this.shouldRetryRequest(error),
            onRetry = () => {},
        } = options;

        let lastError;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                // Check network status before attempting
                if (!this.isOnline && attempt === 0) {
                    // Add to retry queue for later
                    return this.addToRetryQueue(fn, options);
                }
                
                const result = await fn();
                return result;
            } catch (error) {
                lastError = error;
                
                if (attempt < maxRetries && shouldRetry(error)) {
                    onRetry(attempt + 1, error);
                    
                    // Exponential backoff
                    const delay = retryDelay * Math.pow(2, attempt);
                    await this.delay(delay);
                } else {
                    break;
                }
            }
        }
        
        throw lastError;
    }

    shouldRetryRequest(error) {
        // Retry on network errors
        if (!error.response) {
            return true;
        }
        
        // Retry on 5xx server errors
        if (error.response && error.response.status >= 500) {
            return true;
        }
        
        // Retry on specific status codes
        const retryableCodes = [408, 429, 503, 504];
        if (error.response && retryableCodes.includes(error.response.status)) {
            return true;
        }
        
        return false;
    }

    addToRetryQueue(fn, options) {
        return new Promise((resolve, reject) => {
            this.retryQueue.push({
                fn,
                options,
                resolve,
                reject,
                timestamp: Date.now(),
            });
        });
    }

    async processRetryQueue() {
        const queue = [...this.retryQueue];
        this.retryQueue = [];
        
        for (const item of queue) {
            try {
                const result = await this.executeWithRetry(item.fn, item.options);
                item.resolve(result);
            } catch (error) {
                item.reject(error);
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Subscribe to network status changes
    addNetworkListener(callback) {
        const id = Date.now().toString();
        this.listeners.set(id, callback);
        
        // Call immediately with current status
        callback(this.isOnline);
        
        // Return unsubscribe function
        return () => {
            this.listeners.delete(id);
        };
    }

    notifyListeners(isOnline) {
        this.listeners.forEach(callback => {
            try {
                callback(isOnline);
            } catch (error) {
                console.error('Error in network listener:', error);
            }
        });
    }

    // Get current network status
    getNetworkStatus() {
        return this.isOnline;
    }

    // Clear retry queue
    clearRetryQueue() {
        this.retryQueue.forEach(item => {
            item.reject(new Error('Retry queue cleared'));
        });
        this.retryQueue = [];
    }
}

// Create singleton instance
const networkRetryManager = new NetworkRetryManager();

// Export convenience functions
export const withRetry = (fn, options) => networkRetryManager.executeWithRetry(fn, options);
export const isOnline = () => networkRetryManager.getNetworkStatus();
export const onNetworkChange = (callback) => networkRetryManager.addNetworkListener(callback);

export default networkRetryManager;