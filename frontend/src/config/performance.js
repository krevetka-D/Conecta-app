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
};

// Image optimization settings
export const IMAGE_CONFIG = {
    resizeMode: 'cover',
    defaultSource: require('../../assets/placeholder.png'), // Add a placeholder image
    cache: Platform.OS === 'ios' ? 'default' : 'force-cache',
};

// Animation settings
export const ANIMATION_CONFIG = {
    useNativeDriver: true,
    duration: 300,
};

// Network optimization
export const NETWORK_CONFIG = {
    timeout: 30000,
    maxRetries: 3,
    retryDelay: 1000,
    cacheTime: 5 * 60 * 1000, // 5 minutes
};

// Memory optimization
export const MEMORY_CONFIG = {
    maxCacheSize: 50, // Maximum items to keep in cache
    clearCacheOnLowMemory: true,
};

// Debounce/Throttle delays
export const INTERACTION_DELAYS = {
    search: 500,
    scroll: 100,
    input: 300,
    refresh: 1000,
};

// Enable/disable features based on device capabilities
export const FEATURE_FLAGS = {
    enableAnimations: true,
    enableShadows: Platform.OS === 'ios',
    enableHapticFeedback: Platform.OS === 'ios',
    enableOfflineMode: true,
    enableImageCaching: true,
};