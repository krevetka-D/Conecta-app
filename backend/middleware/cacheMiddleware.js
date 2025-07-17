import NodeCache from 'node-cache';

// Create a cache instance with 5 minutes TTL
const cache = new NodeCache({ stdTTL: 300 });

export const cacheMiddleware = (duration = 300) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = req.originalUrl || req.url;
        const cachedData = cache.get(key);

        if (cachedData) {
            return res.json(cachedData);
        }

        // Store the original json method
        const originalJson = res.json;

        // Override the json method
        res.json = function(data) {
            // Cache the data
            cache.set(key, data, duration);

            // Call the original json method
            return originalJson.call(this, data);
        };

        next();
    };
};

export const clearCache = (pattern) => {
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
};