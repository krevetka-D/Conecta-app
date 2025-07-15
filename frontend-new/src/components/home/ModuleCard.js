import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const ModuleCard = ({ title, description, onPress }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.base,
        padding: SIZES.large,
        marginBottom: SIZES.medium,
        // iOS shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        // Android shadow
        elevation: 3,
    },
    title: {
        ...FONTS.h3,
        color: COLORS.black,
    },
    description: {
        ...FONTS.body,
        color: COLORS.gray,
        marginTop: SIZES.base,
    },
});

export default ModuleCard;