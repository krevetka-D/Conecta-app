
import NodeCache from 'node-cache';
import crypto from 'crypto';

const { getAsync, setAsync, delAsync } = require('../config/redis');

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

// Enhanced cache middleware with Redis support
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
        
        // Try to get from memory cache first
        let cachedData = cache.get(key);

        if (cachedData) {
            res.setHeader('X-Cache', 'HIT');
            res.setHeader('X-Cache-Type', 'memory');
            return res.json(cachedData);
        }

        // Try Redis if memory cache miss
        try {
            const redisData = await getAsync(key);
            if (redisData) {
                cachedData = JSON.parse(redisData);
                // Store in memory cache for faster subsequent access
                cache.set(key, cachedData);
                res.setHeader('X-Cache', 'HIT');
                res.setHeader('X-Cache-Type', 'redis');
                return res.json(cachedData);
            }
        } catch (error) {
            console.error('Redis get error:', error);
            // Continue without cache on Redis error
        }

        // Store original json method
        const originalJson = res.json;

        // Override json method
        res.json = async function(data) {
            res.setHeader('X-Cache', 'MISS');
            // Only cache successful responses
            if (res.statusCode === 200) {
                // Store in memory cache
                cache.set(key, data);
                
                // Store in Redis asynchronously
                try {
                    await setAsync(key, JSON.stringify(data), 'EX', ttl);
                } catch (error) {
                    console.error('Redis set error:', error);
                    // Continue even if Redis fails
                }
            }
            return originalJson.call(this, data);
        };

        next();
    };
};

// Clear cache with Redis support
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

    // Clear Redis cache
    try {
        if (pattern) {
            // Note: This is a simplified approach. In production, you might want to use Redis SCAN
            // to find and delete keys matching the pattern
            await delAsync(pattern);
        }
    } catch (error) {
        console.error('Redis clear error:', error);
    }
};

// Get async wrapper for Redis-backed cache
export const getAsync = async (key) => {
    try {
        const data = await getAsync(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Cache getAsync error:', error);
        return null;
    }
};

// Set async wrapper for Redis-backed cache
export const setAsync = async (key, data, ttl = 300) => {
    try {
        await setAsync(key, JSON.stringify(data), 'EX', ttl);
        return true;
    } catch (error) {
        console.error('Cache setAsync error:', error);
        return false;
    }
};

// Delete async wrapper for Redis-backed cache
export const delAsync = async (key) => {
    try {
        await delAsync(key);
        return true;
    } catch (error) {
        console.error('Cache delAsync error:', error);
        return false;
    }
};