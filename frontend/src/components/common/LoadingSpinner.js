// frontend/src/components/common/LoadingSpinner.js
import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

import { colors } from '../../constants/theme';
import { styles } from '../../styles/components/common/LoadingSpinnerStyles';

const LoadingSpinner = ({
    size = 'large', // ActivityIndicator accepts 'small' or 'large' as strings
    color = colors.primary,
    text = '',
    fullScreen = false,
    overlay = false,
    style,
    textStyle,
}) => {
    const containerStyle = [
        styles.container,
        fullScreen && styles.fullScreen,
        overlay && styles.overlay,
        style,
    ];

    // Ensure size is valid for ActivityIndicator
    const validSize = size === 'small' || size === 'large' ? size : 'large';

    return (
        <View style={containerStyle}>
            <ActivityIndicator size={validSize} color={color} style={styles.spinner} />
            {text ? <Text style={[styles.text, textStyle]}>{text}</Text> : null}
        </View>
    );
};

export default LoadingSpinner;
