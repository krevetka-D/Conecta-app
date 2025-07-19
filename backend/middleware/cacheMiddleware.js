// backend/middleware/cacheMiddleware.js - Enhanced version
import NodeCache from 'node-cache';
import crypto from 'crypto';

// Create cache instances with different TTLs
const caches = {
    short: new NodeCache({ stdTTL: 60 }), // 1 minute
    medium: new NodeCache({ stdTTL: 300 }), // 5 minutes
    long: new NodeCache({ stdTTL: 3600 }), // 1 hour
};

export const cacheMiddleware = (duration = 'medium', customKey = null) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const cache = caches[duration] || caches.medium;
        
        // Generate cache key
        const key = customKey 
            ? typeof customKey === 'function' ? customKey(req) : customKey
            : `${req.originalUrl || req.url}_${req.user?._id || 'public'}`;
        
        const cachedData = cache.get(key);

        if (cachedData) {
            res.setHeader('X-Cache', 'HIT');
            return res.json(cachedData);
        }

        // Store original json method
        const originalJson = res.json;

        // Override json method
        res.json = function(data) {
            res.setHeader('X-Cache', 'MISS');
            // Only cache successful responses
            if (res.statusCode === 200) {
                cache.set(key, data);
            }
            return originalJson.call(this, data);
        };

        next();
    };
};

export const clearCache = (pattern, duration = 'all') => {
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