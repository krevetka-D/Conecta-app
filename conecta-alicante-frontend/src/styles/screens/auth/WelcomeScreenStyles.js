// src/styles/screens/auth/WelcomeScreenStyles.js
import { StyleSheet } from 'react-native';
import { colors, fonts } from '../../../constants/theme';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'space-between',
        padding: 20,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: fonts.sizes.h1,
        fontFamily: fonts.families.bold,
        color: colors.text,
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: fonts.sizes.lg,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    actions: {
        paddingBottom: 20,
    },
    button: {
        marginTop: 12,
        paddingVertical: 8,
        borderRadius: 30,
    },
    buttonLabel: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.bold,
    },
});
