// frontend/src/utils/performance.js
import { InteractionManager, Text } from 'react-native';
import React, { useCallback, useRef, useMemo } from 'react';

export const runAfterInteractions = (callback) => {
    return InteractionManager.runAfterInteractions(() => {
        if (typeof callback === 'function') {
            callback();
        }
    });
};

export const debounce = (func, wait, immediate = false) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
};

export const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// React hooks for performance
export const useDebounce = (callback, delay) => {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    return useCallback(
        debounce((...args) => callbackRef.current(...args), delay),
        [delay]
    );
};

export const useThrottle = (callback, delay) => {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    return useCallback(
        throttle((...args) => callbackRef.current(...args), delay),
        [delay]
    );
};

// Memoization helpers
export const createMemoizedSelector = (selector) => {
    let lastArgs = [];
    let lastResult;

    return (...args) => {
        if (!areArgumentsEqual(args, lastArgs)) {
            lastArgs = args;
            lastResult = selector(...args);
        }
        return lastResult;
    };
};

const areArgumentsEqual = (args1, args2) => {
    if (args1.length !== args2.length) return false;
    return args1.every((arg, index) => arg === args2[index]);
};

// FlatList optimization helpers
export const getItemLayout = (itemHeight, separatorHeight = 0) => (data, index) => ({
    length: itemHeight,
    offset: (itemHeight + separatorHeight) * index,
    index,
});

export const keyExtractor = (item, index) => {
    if (item && typeof item === 'object') {
        return item.id || item._id || item.key || String(index);
    }
    return String(index);
};

// Image optimization
export const optimizeImageUri = (uri, width, height, quality = 0.8) => {
    if (!uri) return uri;

    // Add query parameters for image optimization if using a CDN
    const separator = uri.includes('?') ? '&' : '?';
    return `${uri}${separator}w=${width}&h=${height}&q=${Math.round(quality * 100)}`;
};

// Bundle splitting helper
export const loadComponentAsync = (importFunction) => {
    return React.lazy(() =>
        importFunction().catch(error => {
            console.error('Failed to load component:', error);
            // Return a fallback component
            return { default: () => <Text>Failed to load component</Text> };
        })
    );
};

// Memory management
export const cleanupResources = (...resources) => {
    return () => {
        resources.forEach(resource => {
            if (resource && typeof resource.cleanup === 'function') {
                resource.cleanup();
            } else if (resource && typeof resource.remove === 'function') {
                resource.remove();
            } else if (resource && typeof resource.unsubscribe === 'function') {
                resource.unsubscribe();
            }
        });
    };
};

// State batching for React 18
export const batchUpdates = (updates) => {
    if (typeof updates === 'function') {
        // Use React's automatic batching in React 18
        updates();
    }
};