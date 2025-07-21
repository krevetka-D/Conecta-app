// frontend/src/components/common/OptimizedList.js
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { 
    FlatList, 
    RefreshControl, 
    View, 
    Text, 
    InteractionManager,
    Platform 
} from 'react-native';
import { FLATLIST_CONFIG } from '../../config/performance';
import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';
import { colors } from '../../constants/theme';

const OptimizedList = ({
    data,
    renderItem,
    keyExtractor,
    onRefresh,
    refreshing = false,
    loading = false,
    emptyIcon,
    emptyTitle = 'No items found',
    emptyMessage = 'Pull to refresh',
    ListHeaderComponent,
    ListFooterComponent,
    contentContainerStyle,
    getItemLayout,
    onEndReached,
    onEndReachedThreshold = 0.5,
    estimatedItemSize,
    maintainVisibleContentPosition,
    enableOptimizations = true,
    ...props
}) => {
    const listRef = useRef(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const scrollPositionRef = useRef(0);
    const pendingScrollToRef = useRef(null);

    // Track scroll position for optimization
    const handleScroll = useCallback((event) => {
        scrollPositionRef.current = event.nativeEvent.contentOffset.y;
    }, []);

    // Memoize keyExtractor with fallback
    const memoizedKeyExtractor = useCallback(
        keyExtractor || FLATLIST_CONFIG.keyExtractor,
        []
    );

    // Enhanced render item with interaction handling
    const enhancedRenderItem = useCallback((props) => {
        if (!enableOptimizations) {
            return renderItem(props);
        }

        return (
            <InteractionOptimizedItem
                {...props}
                renderItem={renderItem}
                isInitialLoad={isInitialLoad}
            />
        );
    }, [renderItem, enableOptimizations, isInitialLoad]);

    // Memoize empty component
    const ListEmptyComponent = useMemo(() => {
        if (loading) {
            return <LoadingSpinner />;
        }
        return (
            <EmptyState
                icon={emptyIcon}
                title={emptyTitle}
                message={emptyMessage}
            />
        );
    }, [loading, emptyIcon, emptyTitle, emptyMessage]);

    // Memoize refresh control
    const refreshControl = useMemo(() => {
        if (!onRefresh) return undefined;
        return (
            <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                titleColor={colors.primary}
                progressViewOffset={Platform.OS === 'android' ? 50 : 0}
            />
        );
    }, [refreshing, onRefresh]);

    // Optimize content container style
    const optimizedContentStyle = useMemo(() => {
        const baseStyle = { flexGrow: data?.length === 0 ? 1 : 0 };
        return contentContainerStyle 
            ? [baseStyle, contentContainerStyle]
            : baseStyle;
    }, [data?.length, contentContainerStyle]);

    // Calculate estimated item layout if size provided
    const calculatedGetItemLayout = useMemo(() => {
        if (getItemLayout) return getItemLayout;
        if (!estimatedItemSize) return undefined;

        return (data, index) => ({
            length: estimatedItemSize,
            offset: estimatedItemSize * index,
            index,
        });
    }, [getItemLayout, estimatedItemSize]);

    // Handle initial load completion
    useEffect(() => {
        if (isInitialLoad && data?.length > 0) {
            InteractionManager.runAfterInteractions(() => {
                setIsInitialLoad(false);
            });
        }
    }, [isInitialLoad, data?.length]);

    // Scroll to pending position after layout
    const handleLayout = useCallback(() => {
        if (pendingScrollToRef.current && listRef.current) {
            const { index, viewPosition, animated } = pendingScrollToRef.current;
            listRef.current.scrollToIndex({ index, viewPosition, animated });
            pendingScrollToRef.current = null;
        }
    }, []);

    // Public method to scroll to index
    const scrollToIndex = useCallback((params) => {
        if (listRef.current) {
            try {
                listRef.current.scrollToIndex(params);
            } catch (error) {
                // If list not ready, store for later
                pendingScrollToRef.current = params;
            }
        }
    }, []);

    // Optimize view config for better performance
    const viewConfigRef = useRef({
        minimumViewTime: 100,
        viewAreaCoveragePercentThreshold: 50,
        itemVisiblePercentThreshold: 50,
        waitForInteraction: !isInitialLoad,
    });

    return (
        <FlatList
            ref={listRef}
            {...FLATLIST_CONFIG}
            {...props}
            data={data}
            renderItem={enhancedRenderItem}
            keyExtractor={memoizedKeyExtractor}
            contentContainerStyle={optimizedContentStyle}
            refreshControl={refreshControl}
            ListEmptyComponent={ListEmptyComponent}
            ListHeaderComponent={ListHeaderComponent}
            ListFooterComponent={ListFooterComponent}
            getItemLayout={calculatedGetItemLayout}
            onEndReached={onEndReached}
            onEndReachedThreshold={onEndReachedThreshold}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            onScroll={enableOptimizations ? handleScroll : undefined}
            scrollEventThrottle={enableOptimizations ? 16 : undefined}
            onLayout={handleLayout}
            viewabilityConfig={viewConfigRef.current}
            maintainVisibleContentPosition={maintainVisibleContentPosition || (
                Platform.OS === 'ios' && enableOptimizations ? {
                    minIndexForVisible: 0,
                    autoscrollToTopThreshold: 100,
                } : undefined
            )}
            // Performance optimizations
            drawDistance={enableOptimizations ? 250 : undefined}
            legacyImplementation={false}
            removeClippedSubviews={Platform.OS === 'android' && enableOptimizations}
            // Memory optimizations
            initialScrollIndex={0}
            persistentScrollbar={false}
            overScrollMode="never"
        />
    );
};

// Optimized item wrapper component
const InteractionOptimizedItem = React.memo(({ 
    renderItem, 
    isInitialLoad, 
    ...props 
}) => {
    const [shouldRender, setShouldRender] = useState(!isInitialLoad);

    useEffect(() => {
        if (isInitialLoad && !shouldRender) {
            InteractionManager.runAfterInteractions(() => {
                setShouldRender(true);
            });
        }
    }, [isInitialLoad, shouldRender]);

    if (!shouldRender) {
        // Render placeholder during initial load
        return (
            <View style={{ height: 80, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2 }} />
            </View>
        );
    }

    return renderItem(props);
});

// Export enhanced list with additional methods
export default React.forwardRef((props, ref) => {
    const listRef = useRef(null);

    React.useImperativeHandle(ref, () => ({
        scrollToIndex: (params) => listRef.current?.scrollToIndex(params),
        scrollToOffset: (params) => listRef.current?.scrollToOffset(params),
        scrollToEnd: (params) => listRef.current?.scrollToEnd(params),
        flashScrollIndicators: () => listRef.current?.flashScrollIndicators(),
    }));

    return <OptimizedList {...props} ref={listRef} />;
});