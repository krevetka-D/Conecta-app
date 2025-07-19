// frontend/src/components/common/SafeActivityIndicator.js
import React from 'react';
import { ActivityIndicator as RNActivityIndicator } from 'react-native';

/**
 * Safe wrapper for ActivityIndicator that ensures proper size values
 */
const SafeActivityIndicator = ({ size, ...props }) => {
    // Convert various size inputs to valid ActivityIndicator sizes
    let validSize = 'large'; // default
    
    if (typeof size === 'string') {
        if (size === 'small' || size === 'large') {
            validSize = size;
        } else if (size === 'tiny' || size === 'xs' || size === 'sm') {
            validSize = 'small';
        } else if (size === 'medium' || size === 'md' || size === 'lg' || size === 'xl' || size === 'huge') {
            validSize = 'large';
        }
    } else if (typeof size === 'number') {
        // If numeric size is provided, convert to small/large
        validSize = size < 30 ? 'small' : 'large';
    }
    
    return <RNActivityIndicator size={validSize} {...props} />;
};

export default SafeActivityIndicator;

// You can also export a hook to handle size conversion
export const useActivityIndicatorSize = (size) => {
    if (typeof size === 'string') {
        if (size === 'small' || size === 'large') {
            return size;
        }
        return size.includes('small') || size.includes('tiny') ? 'small' : 'large';
    }
    if (typeof size === 'number') {
        return size < 30 ? 'small' : 'large';
    }
    return 'large';
};