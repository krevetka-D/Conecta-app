// frontend/src/components/common/LoadingSpinner.js
import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { styles } from '../../styles/components/common/LoadingSpinnerStyles';
import { colors } from '../../constants/theme';

const LoadingSpinner = ({
    size = 'large', // This is correct - ActivityIndicator accepts 'small' or 'large'
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

    return (
        <View style={containerStyle}>
            <ActivityIndicator
                size={size} // Make sure this receives 'small' or 'large', not a number
                color={color}
                style={styles.spinner}
            />
            {text ? (
                <Text style={[styles.text, textStyle]}>{text}</Text>
            ) : null}
        </View>
    );
};

export default LoadingSpinner;