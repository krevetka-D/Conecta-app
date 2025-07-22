import NodeCache from 'node-cache';
import crypto from 'crypto';

// Note: Redis integration is commented out until redis.js is converted to ES modules
// const { getAsync, setAsync, delAsync } = require('../config/redis');

// Cache instances with different TTLs
const caches = {
    short: new NodeCache({ stdTTL: 60 }), // 1 minute
    medium: new NodeCache({ stdTTL: 300 }), // 5 minutes
    long: new NodeCache({ stdTTL: 3600 }), // 1 hour
};

// Configuration for cache durations
const CACHE_DURATIONS = {
    short: 60,
    medium: 300,
    long: 3600,
};

// Enhanced cache middleware (Redis temporarily disabled)
export const cacheMiddleware = (duration = 'medium', customKey = null) => {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const cache = caches[duration] || caches.medium;
        const ttl = CACHE_DURATIONS[duration] || CACHE_DURATIONS.medium;
        
        // Generate cache key
        const key = customKey 
            ? typeof customKey === 'function' ? customKey(req) : customKey
            : `${req.originalUrl || req.url}_${req.user?._id || 'public'}`;
        
        // Try to get from memory cache
        let cachedData = cache.get(key);

        if (cachedData) {
            res.setHeader('X-Cache', 'HIT');
            res.setHeader('X-Cache-Type', 'memory');
            return res.json(cachedData);
        }

        // Store original json method
        const originalJson = res.json;

        // Override json method
        res.json = function(data) {
            res.setHeader('X-Cache', 'MISS');
            // Only cache successful responses
            if (res.statusCode === 200) {
                // Store in memory cache
                cache.set(key, data);
            }
            return originalJson.call(this, data);
        };

        next();
    };
};

// Clear cache (Redis temporarily disabled)
export const clearCache = async (pattern, duration = 'all') => {
    // Clear memory cache
    if (duration === 'all') {
        Object.values(caches).forEach(cache => {
            if (pattern) {
                const keys = cache.keys();
                keys.forEach(key => {
                    if (key.includes(pattern)) {
                        cache.del(key);
                    }
                });
            } else {
                cache.flushAll();
            }
        });
    } else {
        const cache = caches[duration];
        if (cache) {
            if (pattern) {
                const keys = cache.keys();
                keys.forEach(key => {
                    if (key.includes(pattern)) {
                        cache.del(key);
                    }
                });
            } else {
                cache.flushAll();
            }
        }
    }
};

// Cache utility functions (simplified without Redis for now)
export const getCacheAsync = async (key) => {
    try {
        // Try all cache levels
        for (const [name, cache] of Object.entries(caches)) {
            const data = cache.get(key);
            if (data) return data;
        }
        return null;
    } catch (error) {
        console.error('Cache get error:', error);
        return null;
    }
};

export const setCacheAsync = async (key, data, ttl = 300) => {
    try {
        // Determine which cache to use based on TTL
        let cacheToUse = caches.medium;
        if (ttl <= 60) cacheToUse = caches.short;
        else if (ttl >= 3600) cacheToUse = caches.long;
        
        cacheToUse.set(key, data, ttl);
        return true;
    } catch (error) {
        console.error('Cache set error:', error);
        return false;
    }
};

export const delCacheAsync = async (key) => {
    try {
        // Delete from all caches
        Object.values(caches).forEach(cache => {
            cache.del(key);
        });
        return true;
    } catch (error) {
        console.error('Cache delete error:', error);
        return false;
    }
};