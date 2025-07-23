// frontend/src/config/performance.js
import { Platform } from 'react-native';

// FlatList optimization settings
export const FLATLIST_CONFIG = {
    removeClippedSubviews: Platform.OS === 'android',
    maxToRenderPerBatch: 10,
    updateCellsBatchingPeriod: 50,
    initialNumToRender: 10,
    windowSize: 10,
    getItemLayout: undefined, // Define per list if items have fixed height
    keyExtractor: (item, index) => item?._id || item?.id || String(index),

    // Additional optimizations
    scrollEventThrottle: 16,
    disableVirtualization: false,
    directionalLockEnabled: true,
    alwaysBounceVertical: false,
    scrollIndicatorInsets: { right: 1 },

    // Memory optimizations
    maintainVisibleContentPosition:
        Platform.OS === 'ios'
            ? {
                minIndexForVisible: 0,
                autoscrollToTopThreshold: 100,
            }
            : undefined,
};

// Image optimization settings
export const IMAGE_CONFIG = {
    resizeMode: 'cover',
    defaultSource: require('../../assets/placeholder.png'), // Add a placeholder image
    cache: Platform.OS === 'ios' ? 'default' : 'force-cache',

    // Additional optimizations
    fadeDuration: Platform.OS === 'android' ? 0 : 300,
    progressiveRenderingEnabled: true,
    priorityFastImage: 'high',
};

// Animation settings
export const ANIMATION_CONFIG = {
    useNativeDriver: true,
    duration: 300,

    // Additional timing functions
    timing: {
        fast: 200,
        normal: 300,
        slow: 500,
    },
    spring: {
        damping: 15,
        mass: 1,
        stiffness: 100,
    },
};

// Network optimization
export const NETWORK_CONFIG = {
    timeout: 30000,
    maxRetries: 3,
    retryDelay: 1000,
    cacheTime: 5 * 60 * 1000, // 5 minutes

    // Request optimization
    headers: {
        'Accept-Encoding': 'gzip, deflate',
        'Cache-Control': 'max-age=3600',
    },

    // Response caching
    cacheResponses: true,
    maxCacheSize: 50 * 1024 * 1024, // 50MB
};

// Memory optimization
export const MEMORY_CONFIG = {
    maxCacheSize: 50, // Maximum items to keep in cache
    clearCacheOnLowMemory: true,

    // Image cache limits
    imageCacheSize: 200 * 1024 * 1024, // 200MB
    imageMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Debounce/Throttle delays
export const INTERACTION_DELAYS = {
    search: 500,
    scroll: 100,
    input: 300,
    refresh: 1000,

    // Additional delays
    typing: 1000,
    navigation: 200,
    modalAnimation: 300,
};

// Enable/disable features based on device capabilities
export const FEATURE_FLAGS = {
    enableAnimations: true,
    enableShadows: Platform.OS === 'ios',
    enableHapticFeedback: Platform.OS === 'ios',
    enableOfflineMode: true,
    enableImageCaching: true,

    // Additional flags
    enableLazyLoading: true,
    enablePrefetch: true,
    enableBatchRequests: true,
    enableCompression: true,
};

// Performance monitoring
export const PERFORMANCE_CONFIG = {
    enableMetrics: __DEV__,
    logSlowRenders: __DEV__,
    warnSlowListThreshold: 100, // ms
    trackInteractions: __DEV__,
};
