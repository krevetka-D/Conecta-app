// frontend/src/services/api/client.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

import { API_BASE_URL } from '../../config/network';
import { devLog, devError } from '../../utils';
import { cache } from '../../utils/cacheManager';
import { withRetry } from '../../utils/networkRetry';


// Request queue for offline support
class RequestQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
    }

    async add(config) {
        this.queue.push({
            ...config,
            timestamp: Date.now(),
            id: `${Date.now()}_${Math.random()}`,
        });

        // Store in AsyncStorage for persistence
        await this.persist();
    }

    async process() {
        if (this.processing || this.queue.length === 0) return;

        this.processing = true;

        while (this.queue.length > 0) {
            const request = this.queue[0];

            try {
                await axios(request);
                this.queue.shift();
                await this.persist();
            } catch (error) {
                if (this.shouldRetryLater(error)) {
                    break;
                } else {
                    // Remove failed request
                    this.queue.shift();
                    await this.persist();
                }
            }
        }

        this.processing = false;
    }

    shouldRetryLater(error) {
        return !error.response || error.response.status >= 500;
    }

    async persist() {
        try {
            await AsyncStorage.setItem('request_queue', JSON.stringify(this.queue));
        } catch (error) {
            devError('API Client', 'Failed to persist request queue', error);
        }
    }

    async restore() {
        try {
            const stored = await AsyncStorage.getItem('request_queue');
            if (stored) {
                this.queue = JSON.parse(stored);
            }
        } catch (error) {
            devError('API Client', 'Failed to restore request queue', error);
        }
    }
}

// Create optimized axios instance
const createOptimizedClient = () => {
    const requestQueue = new RequestQueue();

    const client = axios.create({
        baseURL: API_BASE_URL,
        timeout: 30000,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Platform': Platform.OS,
            'X-App-Version': '1.0.0',
        },
    });

    // Request interceptor
    client.interceptors.request.use(
        async (config) => {
            // Add auth token
            const token = await AsyncStorage.getItem('userToken');
            if (token && !config.headers.skipAuth) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // Add request ID for tracking
            config.headers['X-Request-ID'] = `${Date.now()}_${Math.random()}`;

            // Check cache for GET requests
            if (config.method === 'get' && config.cache !== false) {
                const cacheKey = `api_${config.url}_${JSON.stringify(config.params || {})}`;
                const cached = await cache.get(cacheKey);

                if (cached !== null) {
                    // Return cached response
                    config.adapter = () =>
                        Promise.resolve({
                            data: cached,
                            status: 200,
                            statusText: 'OK (from cache)',
                            headers: {},
                            config,
                        });
                }
            }

            // Add timestamp
            config.metadata = { startTime: Date.now() };

            return config;
        },
        (error) => {
            return Promise.reject(error);
        },
    );

    // Response interceptor
    client.interceptors.response.use(
        async (response) => {
            // Log response time in development
            if (__DEV__ && response.config.metadata) {
                const duration = Date.now() - response.config.metadata.startTime;
                devLog('API Client', `API ${response.config.method.toUpperCase()} ${response.config.url} - ${duration}ms`);
            }

            // Cache successful GET responses
            if (response.config.method === 'get' && response.config.cache !== false) {
                const cacheKey = `api_${response.config.url}_${JSON.stringify(
                    response.config.params || {},
                )}`;
                const cacheTTL = response.config.cacheTTL || 5 * 60 * 1000; // 5 minutes default

                await cache.set(cacheKey, response.data, {
                    ttl: cacheTTL,
                    persistent: response.config.persistCache || false,
                });
            }

            return response.data;
        },
        async (error) => {
            const { config, response } = error;

            // Log error in development
            if (__DEV__) {
                devError('API Client', `API Error ${config?.method?.toUpperCase()} ${config?.url}`, {
                    status: response?.status,
                    data: response?.data,
                    message: error.message,
                });
            }

            // Handle specific error cases
            if (!response) {
                // Network error - add to queue if it's a mutation
                if (config && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
                    await requestQueue.add(config);
                    return Promise.reject(new Error('Request queued for retry when online'));
                }

                return Promise.reject(new Error('Network error - please check your connection'));
            }

            // Handle 401 - Unauthorized
            if (response.status === 401 && !config.skipAuthRefresh) {
                // Clear auth and redirect to login
                await AsyncStorage.multiRemove(['userToken', 'user']);

                // Notify app about auth failure
                if (global.authFailureHandler) {
                    global.authFailureHandler();
                }

                return Promise.reject(new Error('Session expired - please login again'));
            }

            // Handle rate limiting
            if (response.status === 429) {
                const retryAfter = response.headers['retry-after'];
                const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000;

                return new Promise((resolve, reject) => {
                    setTimeout(async () => {
                        try {
                            const result = await client.request(config);
                            resolve(result);
                        } catch (retryError) {
                            reject(retryError);
                        }
                    }, delay);
                });
            }

            // Extract error message
            const errorMessage =
                response.data?.message ||
                response.data?.error ||
                error.message ||
                'An error occurred';

            return Promise.reject(new Error(errorMessage));
        },
    );

    // Restore request queue
    requestQueue.restore();

    // Process queue when online
    if (global.addEventListener) {
        global.addEventListener('online', () => {
            requestQueue.process();
        });
    }

    return {
        client,
        defaults: client.defaults,

        // Convenience methods with retry
        get: (url, config) => withRetry(() => client.get(url, config)),
        post: (url, data, config) => withRetry(() => client.post(url, data, config)),
        put: (url, data, config) => withRetry(() => client.put(url, data, config)),
        patch: (url, data, config) => withRetry(() => client.patch(url, data, config)),
        delete: (url, config) => withRetry(() => client.delete(url, config)),

        // Clear cache for specific endpoint
        clearCache: (url, params) => {
            const cacheKey = `api_${url}_${JSON.stringify(params || {})}`;
            return cache.invalidate(cacheKey);
        },

        // Clear all API cache
        clearAllCache: () => cache.invalidatePattern('^api_'),

        // Get cache stats
        getCacheStats: () => cache.getStats(),

        // Set auth failure handler
        setAuthFailureHandler: (handler) => {
            global.authFailureHandler = handler;
        },
    };
};

// Create and export optimized client
const apiClient = createOptimizedClient();

export default apiClient;
