// frontend/src/components/common/PlaceholderImage.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

const PlaceholderImage = ({ width = 100, height = 100, text = '?' }) => {
    return (
        <View style={[styles.container, { width, height }]}>
            <Text style={styles.text}>{text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    text: {
        fontSize: 24,
        color: colors.textSecondary,
    },
});

export default PlaceholderImage;