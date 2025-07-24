import { getIO } from '../websocket.js';

// In-memory cache store
const cacheStore = new Map();

/**
 * Clear cache for specific endpoints
 * @param {string|string[]} endpoints - Endpoint(s) to clear cache for
 */
export function clearCache(endpoints) {
    const endpointsArray = Array.isArray(endpoints) ? endpoints : [endpoints];
    
    endpointsArray.forEach(endpoint => {
        // Clear from in-memory store
        const keysToDelete = [];
        cacheStore.forEach((value, key) => {
            if (key.includes(endpoint)) {
                keysToDelete.push(key);
            }
        });
        
        keysToDelete.forEach(key => cacheStore.delete(key));
        
        console.log(`Cache cleared for: ${endpoint}`);
    });
    
    // Emit cache invalidation event via socket
    const io = getIO();
    if (io) {
        io.emit('cache_invalidated', { endpoints: endpointsArray });
    }
}

/**
 * Clear all cache
 */
export function clearAllCache() {
    cacheStore.clear();
    console.log('All cache cleared');
    
    // Emit cache invalidation event
    const io = getIO();
    if (io) {
        io.emit('cache_invalidated', { all: true });
    }
}

/**
 * Get from cache
 * @param {string} key - Cache key
 * @returns {any} Cached value or null
 */
export function getFromCache(key) {
    const cached = cacheStore.get(key);
    if (cached && cached.expiry > Date.now()) {
        return cached.data;
    }
    cacheStore.delete(key);
    return null;
}

/**
 * Set in cache
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds
 */
export function setInCache(key, data, ttl = 60000) {
    cacheStore.set(key, {
        data,
        expiry: Date.now() + ttl
    });
}

export default {
    clearCache,
    clearAllCache,
    getFromCache,
    setInCache
};