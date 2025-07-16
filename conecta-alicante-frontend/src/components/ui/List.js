// src/components/ui/List.js
import React from 'react';
import { FlatList, RefreshControl } from 'react-native';
import EmptyState from '../common/EmptyState';
import LoadingSpinner from '../common/LoadingSpinner';
import {styles } from '../../styles/components/ui/ListStyles';

export const List = React.memo(({
                                    data,
                                    renderItem,
                                    keyExtractor,
                                    onRefresh,
                                    refreshing = false,
                                    loading = false,
                                    emptyIcon,
                                    emptyTitle,
                                    emptyMessage,
                                    contentContainerStyle,
                                    ...props
                                }) => {
    if (loading && !data?.length) {
        return <LoadingSpinner />;
    }

    return (
        <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={[
                styles.container,
                !data?.length && styles.emptyContainer,
                contentContainerStyle,
            ]}
            refreshControl={
                onRefresh ? (
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#1E3A8A"
                    />
                ) : null
            }
            ListEmptyComponent={
                <EmptyState
                    icon={emptyIcon}
                    title={emptyTitle}
                    message={emptyMessage}
                />
            }
            showsVerticalScrollIndicator={false}
            {...props}
        />
    );
});