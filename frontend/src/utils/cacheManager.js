// frontend/src/utils/cacheManager.js
import AsyncStorage from '@react-native-async-storage/async-storage';

class CacheManager {
    constructor() {
        this.memoryCache = new Map();
        this.cacheTimestamps = new Map();
        this.defaultTTL = 5 * 60 * 1000; // 5 minutes
        this.maxMemoryCacheSize = 50; // Maximum items in memory
        this.persistentKeys = new Set(); // Keys that should persist across sessions

        // Start periodic cleanup
        this.startCleanupTimer();
    }

    // Set cache with TTL
    async set(key, value, options = {}) {
        const { ttl = this.defaultTTL, persistent = false, skipMemory = false } = options;

        const cacheData = {
            value,
            timestamp: Date.now(),
            ttl,
        };

        // Store in memory cache if not skipped
        if (!skipMemory) {
            this.setMemoryCache(key, cacheData);
        }

        // Store in persistent storage if needed
        if (persistent) {
            this.persistentKeys.add(key);
            try {
                await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
            } catch (error) {
                console.error('Failed to persist cache:', error);
            }
        }

        return value;
    }

    // Get from cache
    async get(key, options = {}) {
        const { fallback = null, forceRefresh = false } = options;

        if (forceRefresh) {
            this.invalidate(key);
            return fallback;
        }

        // Check memory cache first
        const memoryData = this.getFromMemoryCache(key);
        if (memoryData !== null) {
            return memoryData;
        }

        // Check persistent storage
        if (this.persistentKeys.has(key)) {
            try {
                const stored = await AsyncStorage.getItem(`cache_${key}`);
                if (stored) {
                    const cacheData = JSON.parse(stored);
                    if (this.isValid(cacheData)) {
                        // Restore to memory cache
                        this.setMemoryCache(key, cacheData);
                        return cacheData.value;
                    } else {
                        // Clean up expired data
                        await AsyncStorage.removeItem(`cache_${key}`);
                        this.persistentKeys.delete(key);
                    }
                }
            } catch (error) {
                console.error('Failed to read from persistent cache:', error);
            }
        }

        return fallback;
    }

    // Get or set pattern
    async getOrSet(key, fetcher, options = {}) {
        const cached = await this.get(key, { forceRefresh: options.forceRefresh });

        if (cached !== null && cached !== undefined) {
            return cached;
        }

        try {
            const value = await fetcher();
            return await this.set(key, value, options);
        } catch (error) {
            console.error('Failed to fetch and cache:', error);
            throw error;
        }
    }

    // Set memory cache with size limit
    setMemoryCache(key, cacheData) {
        // Remove oldest entries if cache is too large
        if (this.memoryCache.size >= this.maxMemoryCacheSize) {
            const oldestKey = this.getOldestCacheKey();
            if (oldestKey) {
                this.memoryCache.delete(oldestKey);
                this.cacheTimestamps.delete(oldestKey);
            }
        }

        this.memoryCache.set(key, cacheData);
        this.cacheTimestamps.set(key, cacheData.timestamp);
    }

    // Get from memory cache
    getFromMemoryCache(key) {
        const cacheData = this.memoryCache.get(key);

        if (!cacheData) {
            return null;
        }

        if (this.isValid(cacheData)) {
            return cacheData.value;
        }

        // Clean up expired data
        this.memoryCache.delete(key);
        this.cacheTimestamps.delete(key);
        return null;
    }

    // Check if cache data is valid
    isValid(cacheData) {
        const { timestamp, ttl } = cacheData;
        return Date.now() - timestamp < ttl;
    }

    // Get oldest cache key
    getOldestCacheKey() {
        let oldestKey = null;
        let oldestTime = Infinity;

        this.cacheTimestamps.forEach((timestamp, key) => {
            if (timestamp < oldestTime) {
                oldestTime = timestamp;
                oldestKey = key;
            }
        });

        return oldestKey;
    }

    // Invalidate specific key
    async invalidate(key) {
        this.memoryCache.delete(key);
        this.cacheTimestamps.delete(key);

        if (this.persistentKeys.has(key)) {
            this.persistentKeys.delete(key);
            try {
                await AsyncStorage.removeItem(`cache_${key}`);
            } catch (error) {
                console.error('Failed to remove persistent cache:', error);
            }
        }
    }

    // Invalidate keys matching pattern
    async invalidatePattern(pattern) {
        const regex = new RegExp(pattern);
        const keysToInvalidate = [];

        this.memoryCache.forEach((_, key) => {
            if (regex.test(key)) {
                keysToInvalidate.push(key);
            }
        });

        await Promise.all(keysToInvalidate.map((key) => this.invalidate(key)));
    }

    // Clear all cache
    async clear() {
        this.memoryCache.clear();
        this.cacheTimestamps.clear();

        // Clear persistent cache
        try {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter((key) => key.startsWith('cache_'));
            await AsyncStorage.multiRemove(cacheKeys);
            this.persistentKeys.clear();
        } catch (error) {
            console.error('Failed to clear persistent cache:', error);
        }
    }

    // Get cache statistics
    getStats() {
        let validCount = 0;
        let expiredCount = 0;
        let totalSize = 0;

        this.memoryCache.forEach((cacheData) => {
            if (this.isValid(cacheData)) {
                validCount++;
            } else {
                expiredCount++;
            }

            // Rough size estimation
            totalSize += JSON.stringify(cacheData.value).length;
        });

        return {
            totalEntries: this.memoryCache.size,
            validEntries: validCount,
            expiredEntries: expiredCount,
            persistentEntries: this.persistentKeys.size,
            estimatedSize: totalSize,
        };
    }

    // Periodic cleanup of expired entries
    startCleanupTimer() {
        setInterval(() => {
            this.cleanup();
        }, 60 * 1000); // Run every minute
    }

    // Clean up expired entries
    cleanup() {
        const keysToDelete = [];

        this.memoryCache.forEach((cacheData, key) => {
            if (!this.isValid(cacheData)) {
                keysToDelete.push(key);
            }
        });

        keysToDelete.forEach((key) => {
            this.memoryCache.delete(key);
            this.cacheTimestamps.delete(key);
        });

        if (keysToDelete.length > 0) {
            console.log(`Cleaned up ${keysToDelete.length} expired cache entries`);
        }
    }

    // Preload cache for critical data
    async preload(entries) {
        const promises = entries.map(({ key, fetcher, options }) =>
            this.getOrSet(key, fetcher, { ...options, forceRefresh: true }),
        );

        try {
            await Promise.all(promises);
            console.log(`Preloaded ${entries.length} cache entries`);
        } catch (error) {
            console.error('Failed to preload cache:', error);
        }
    }
}

// Create singleton instance
const cacheManager = new CacheManager();

// Export convenience functions
export const cache = {
    get: (key, options) => cacheManager.get(key, options),
    set: (key, value, options) => cacheManager.set(key, value, options),
    getOrSet: (key, fetcher, options) => cacheManager.getOrSet(key, fetcher, options),
    invalidate: (key) => cacheManager.invalidate(key),
    invalidatePattern: (pattern) => cacheManager.invalidatePattern(pattern),
    clear: () => cacheManager.clear(),
    getStats: () => cacheManager.getStats(),
    preload: (entries) => cacheManager.preload(entries),
};

export default cacheManager;
