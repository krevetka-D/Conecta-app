import React, { memo, useCallback, useMemo, useRef, useEffect } from 'react';
import { InteractionManager } from 'react-native';

// Memoization helper for expensive computations
export const memoizeComputation = (fn, dependencies = []) => {
    const cache = useRef({});
    
    return useCallback((...args) => {
        const key = JSON.stringify(args);
        
        if (cache.current[key]) {
            return cache.current[key];
        }
        
        const result = fn(...args);
        cache.current[key] = result;
        
        // Clear cache when dependencies change
        useEffect(() => {
            cache.current = {};
        }, dependencies);
        
        return result;
    }, dependencies);
};

// Component render optimization
export const optimizeComponent = (Component, propsAreEqual) => {
    return memo(Component, propsAreEqual || ((prevProps, nextProps) => {
        // Deep comparison for objects
        const keys = Object.keys(prevProps);
        const nextKeys = Object.keys(nextProps);
        
        if (keys.length !== nextKeys.length) return false;
        
        return keys.every(key => {
            if (typeof prevProps[key] === 'function') {
                // Skip function comparison
                return true;
            }
            
            if (typeof prevProps[key] === 'object' && prevProps[key] !== null) {
                // Simple shallow comparison for objects
                return JSON.stringify(prevProps[key]) === JSON.stringify(nextProps[key]);
            }
            
            return prevProps[key] === nextProps[key];
        });
    }));
};

// Batch state updates
export const useBatchedState = (initialState) => {
    const [state, setState] = React.useState(initialState);
    const pendingUpdates = useRef([]);
    const timeoutRef = useRef(null);
    
    const batchedSetState = useCallback((update) => {
        pendingUpdates.current.push(update);
        
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
            setState(currentState => {
                let newState = currentState;
                
                pendingUpdates.current.forEach(update => {
                    if (typeof update === 'function') {
                        newState = update(newState);
                    } else {
                        newState = { ...newState, ...update };
                    }
                });
                
                pendingUpdates.current = [];
                return newState;
            });
        }, 16); // One frame
    }, []);
    
    return [state, batchedSetState];
};

// Lazy loading with suspense
export const lazyWithPreload = (importFn) => {
    let Component = null;
    let promise = null;
    
    const load = () => {
        if (!promise) {
            promise = importFn().then(module => {
                Component = module.default || module;
                return Component;
            });
        }
        return promise;
    };
    
    const LazyComponent = React.lazy(load);
    LazyComponent.preload = load;
    
    return LazyComponent;
};

// Virtual list optimization
export const useVirtualList = (items, itemHeight, containerHeight) => {
    const [scrollTop, setScrollTop] = useState(0);
    
    const visibleItems = useMemo(() => {
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);
        const overscan = 3; // Render extra items for smooth scrolling
        
        return {
            start: Math.max(0, startIndex - overscan),
            end: Math.min(items.length, endIndex + overscan)
        };
    }, [scrollTop, items.length, itemHeight, containerHeight]);
    
    return {
        visibleItems,
        totalHeight: items.length * itemHeight,
        offsetY: visibleItems.start * itemHeight,
        onScroll: (e) => setScrollTop(e.nativeEvent.contentOffset.y)
    };
};

// Image optimization
export const optimizedImage = (uri, { width, height, quality = 0.8 }) => {
    if (!uri) return null;
    
    // Add image optimization parameters
    const optimizedUri = uri.includes('?') 
        ? `${uri}&w=${width}&h=${height}&q=${quality}`
        : `${uri}?w=${width}&h=${height}&q=${quality}`;
    
    return optimizedUri;
};

// Gesture optimization
export const useOptimizedGesture = (handler, dependencies = []) => {
    const handlerRef = useRef(handler);
    
    useEffect(() => {
        handlerRef.current = handler;
    }, dependencies);
    
    return useCallback((event) => {
        // Run gesture handlers after interactions
        InteractionManager.runAfterInteractions(() => {
            handlerRef.current(event);
        });
    }, []);
};

// Memory leak prevention
export const useCleanup = (cleanupFn, dependencies = []) => {
    const isMounted = useRef(true);
    
    useEffect(() => {
        return () => {
            isMounted.current = false;
            cleanupFn();
        };
    }, dependencies);
    
    return isMounted;
};

// Optimized context provider
export const createOptimizedContext = (defaultValue) => {
    const Context = React.createContext(defaultValue);
    
    const Provider = ({ children, value }) => {
        // Memoize context value to prevent unnecessary re-renders
        const memoizedValue = useMemo(() => value, [JSON.stringify(value)]);
        
        return (
            <Context.Provider value={memoizedValue}>
                {children}
            </Context.Provider>
        );
    };
    
    return { Context, Provider };
};

// FlatList optimization presets
export const flatListOptimizations = {
    removeClippedSubviews: true,
    maxToRenderPerBatch: 10,
    updateCellsBatchingPeriod: 50,
    initialNumToRender: 10,
    windowSize: 10,
    getItemLayout: (data, index, itemHeight) => ({
        length: itemHeight,
        offset: itemHeight * index,
        index,
    }),
    keyExtractor: (item, index) => item.id || item._id || index.toString(),
};

// Animation optimization
export const useOptimizedAnimation = (toValue, config = {}) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    
    const animate = useCallback(() => {
        Animated.timing(animatedValue, {
            toValue,
            duration: 300,
            useNativeDriver: true,
            ...config,
        }).start();
    }, [toValue, config]);
    
    return { animatedValue, animate };
};

// Scroll performance optimization
export const scrollOptimizations = {
    scrollEventThrottle: 16,
    decelerationRate: 'fast',
    overScrollMode: 'never',
    showsVerticalScrollIndicator: false,
    showsHorizontalScrollIndicator: false,
};

// Export all optimizations
export default {
    memoizeComputation,
    optimizeComponent,
    useBatchedState,
    lazyWithPreload,
    useVirtualList,
    optimizedImage,
    useOptimizedGesture,
    useCleanup,
    createOptimizedContext,
    flatListOptimizations,
    useOptimizedAnimation,
    scrollOptimizations,
};