// src/styles/screens/auth/RegisterScreenStyles.js
import { StyleSheet } from 'react-native';
import { colors, fonts } from '../../../constants/theme';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
    },
    title: {
        fontSize: fonts.sizes.h2,
        fontFamily: fonts.families.bold,
        color: colors.text,
        marginBottom: 24,
        marginTop: 60,
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 24,
        paddingVertical: 8,
        borderRadius: 30,
    },
});
