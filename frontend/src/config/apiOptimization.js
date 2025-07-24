/**
 * API Optimization Configuration
 * Improves app stability and performance
 */

export const API_OPTIMIZATION = {
    // Request retry configuration
    retry: {
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 5000,
        backoffFactor: 2,
        retryableStatuses: [408, 429, 500, 502, 503, 504],
        retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ENETUNREACH'],
    },

    // Request timeout configuration
    timeout: {
        default: 30000, // 30 seconds
        upload: 60000,  // 60 seconds for file uploads
        download: 60000, // 60 seconds for downloads
        longPoll: 90000,  // 90 seconds for long polling
    },

    // Cache configuration
    cache: {
        enabled: true,
        defaultTTL: 5 * 60 * 1000, // 5 minutes
        endpoints: {
            // Static data - cache longer
            '/config': { ttl: 30 * 60 * 1000 }, // 30 minutes
            '/users/me': { ttl: 10 * 60 * 1000 }, // 10 minutes
            
            // Dynamic data - cache shorter
            '/forums': { ttl: 2 * 60 * 1000 }, // 2 minutes
            '/events': { ttl: 2 * 60 * 1000 }, // 2 minutes
            '/budget': { ttl: 1 * 60 * 1000 }, // 1 minute
            '/checklist': { ttl: 1 * 60 * 1000 }, // 1 minute
            
            // Real-time data - minimal cache
            '/chat/rooms': { ttl: 30 * 1000 }, // 30 seconds
            '/messages': { ttl: 30 * 1000 }, // 30 seconds
            
            // No cache
            '/auth': { ttl: 0 },
            '/chat/updates': { ttl: 0 },
            '/forums/updates': { ttl: 0 },
        },
    },

    // Request queue configuration
    queue: {
        maxConcurrent: 5,
        maxQueued: 50,
        priority: {
            auth: 10,
            realtime: 9,
            user: 8,
            data: 5,
            background: 1,
        },
    },

    // Connection pooling
    connection: {
        keepAlive: true,
        keepAliveMsecs: 30000,
        maxSockets: 10,
        maxFreeSockets: 5,
        timeout: 60000,
        freeSocketTimeout: 30000,
    },

    // Response compression
    compression: {
        enabled: true,
        minSize: 1024, // Only compress responses > 1KB
        level: 6, // zlib compression level (1-9)
    },

    // Error tracking
    errorTracking: {
        enabled: true,
        sampleRate: 1.0, // Track 100% of errors in dev
        ignoreStatuses: [401, 403, 404],
        maxErrorsPerMinute: 10,
    },

    // Performance monitoring
    performance: {
        enabled: true,
        slowRequestThreshold: 3000, // Log requests > 3s
        sampleRate: 0.1, // Sample 10% of requests
    },
};

// Helper to get cache TTL for endpoint
export const getCacheTTL = (endpoint) => {
    // Remove query params for matching
    const path = endpoint.split('?')[0];
    
    // Check exact match first
    if (API_OPTIMIZATION.cache.endpoints[path]) {
        return API_OPTIMIZATION.cache.endpoints[path].ttl;
    }
    
    // Check partial matches
    for (const [pattern, config] of Object.entries(API_OPTIMIZATION.cache.endpoints)) {
        if (path.includes(pattern)) {
            return config.ttl;
        }
    }
    
    return API_OPTIMIZATION.cache.defaultTTL;
};

// Helper to determine request priority
export const getRequestPriority = (endpoint, method = 'GET') => {
    if (endpoint.includes('/auth')) return API_OPTIMIZATION.queue.priority.auth;
    if (endpoint.includes('/chat') || endpoint.includes('/messages')) return API_OPTIMIZATION.queue.priority.realtime;
    if (endpoint.includes('/users')) return API_OPTIMIZATION.queue.priority.user;
    if (method === 'GET') return API_OPTIMIZATION.queue.priority.data;
    return API_OPTIMIZATION.queue.priority.background;
};

// Helper to check if error is retryable
export const isRetryableError = (error) => {
    if (!error) return false;
    
    // Check status codes
    if (error.response?.status && API_OPTIMIZATION.retry.retryableStatuses.includes(error.response.status)) {
        return true;
    }
    
    // Check error codes
    if (error.code && API_OPTIMIZATION.retry.retryableErrors.includes(error.code)) {
        return true;
    }
    
    // Check for network errors
    if (error.message && (
        error.message.includes('Network Error') ||
        error.message.includes('fetch failed') ||
        error.message.includes('Failed to fetch')
    )) {
        return true;
    }
    
    return false;
};