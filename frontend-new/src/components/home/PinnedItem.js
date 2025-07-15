import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install this!
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const PinnedItem = ({ title, icon, onPress }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Ionicons name={icon} size={22} color={COLORS.primary} style={styles.icon} />
            <Text style={styles.title}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.base,
        padding: SIZES.small,
        marginBottom: SIZES.base,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    icon: {
        marginRight: SIZES.small,
    },
    title: {
        ...FONTS.body,
        color: COLORS.black,
    },
});

export default PinnedItem;