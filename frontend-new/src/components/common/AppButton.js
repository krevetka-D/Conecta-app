import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const AppButton = ({ title, onPress, style, textStyle, type = 'primary' }) => {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                type === 'primary' ? styles.primary : styles.secondary,
                style
            ]}
            onPress={onPress}>
            <Text style={[styles.text, textStyle]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: SIZES.medium,
        paddingHorizontal: SIZES.large,
        borderRadius: SIZES.small,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    primary: {
        backgroundColor: COLORS.primary,
    },
    secondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    text: {
        ...FONTS.h3,
        color: COLORS.white,
    },
});

export default AppButton;