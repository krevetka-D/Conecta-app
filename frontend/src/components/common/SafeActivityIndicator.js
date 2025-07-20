// frontend/src/components/common/SafeActivityIndicator.js
import React from 'react';
import { ActivityIndicator as RNActivityIndicator } from 'react-native';

/**
 * Safe wrapper for ActivityIndicator that ensures proper size values
 * This prevents the "Invariant Violation" errors with invalid size props
 */
const SafeActivityIndicator = ({ size, ...props }) => {
    // Convert various size inputs to valid ActivityIndicator sizes
    let validSize = 'large'; // default
    
    if (typeof size === 'string') {
        const lowerSize = size.toLowerCase();
        if (size === 'small' || size === 'large') {
            validSize = size;
        } else if (['tiny', 'xs', 'sm', 'small'].includes(lowerSize)) {
            validSize = 'small';
        } else {
            validSize = 'large';
        }
    } else if (typeof size === 'number') {
        // If numeric size is provided, convert to small/large
        validSize = size < 30 ? 'small' : 'large';
    }
    
    return <RNActivityIndicator size={validSize} {...props} />;
};

// Create a global override to fix all ActivityIndicator uses
export const patchActivityIndicator = () => {
    const ReactNative = require('react-native');
    ReactNative.ActivityIndicator = SafeActivityIndicator;
};

export default SafeActivityIndicator;