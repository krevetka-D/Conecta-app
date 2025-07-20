// frontend/src/components/common/OptimizedList.js
import React, { useCallback, useMemo } from 'react';
import { FlatList, RefreshControl, View, Text } from 'react-native';
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
    ...props
}) => {
    // Memoize keyExtractor with fallback
    const memoizedKeyExtractor = useCallback(
        keyExtractor || FLATLIST_CONFIG.keyExtractor,
        []
    );

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

    return (
        <FlatList
            {...FLATLIST_CONFIG}
            {...props}
            data={data}
            renderItem={renderItem}
            keyExtractor={memoizedKeyExtractor}
            contentContainerStyle={optimizedContentStyle}
            refreshControl={refreshControl}
            ListEmptyComponent={ListEmptyComponent}
            ListHeaderComponent={ListHeaderComponent}
            ListFooterComponent={ListFooterComponent}
            getItemLayout={getItemLayout}
            onEndReached={onEndReached}
            onEndReachedThreshold={onEndReachedThreshold}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
        />
    );
};

export default React.memo(OptimizedList);