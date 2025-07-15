import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

const AppTextInput = ({ style, ...props }) => {
    return (
        <View style={[styles.container, style]}>
            <TextInput
                style={styles.input}
                placeholderTextColor={COLORS.gray}
                {...props}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.lightGray,
        borderRadius: SIZES.small,
        width: '100%',
        padding: SIZES.medium,
        marginVertical: SIZES.base,
    },
    input: {
        fontSize: SIZES.font,
    },
});

export default AppTextInput;