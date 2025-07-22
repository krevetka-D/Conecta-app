// frontend/src/components/common/VirtualizedList.js
import React from 'react';
import { FlatList, View, Text } from 'react-native';

export const VirtualizedList = ({ 
    data, 
    renderItem, 
    itemHeight,
    ...props 
}) => {
    const getItemLayout = useCallback((data, index) => ({
        length: itemHeight,
        offset: itemHeight * index,
        index,
    }), [itemHeight]);

    return (
        <FlatList
            data={data}
            renderItem={renderItem}
            getItemLayout={itemHeight ? getItemLayout : undefined}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={10}
            windowSize={10}
            {...props}
        />
    );
};