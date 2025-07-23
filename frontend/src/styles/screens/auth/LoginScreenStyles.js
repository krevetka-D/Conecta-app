// frontend/src/styles/screens/auth/LoginScreenStyles.js

import { StyleSheet } from 'react-native';

import { colors, fonts } from '../../../constants/theme';

export const loginStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
        paddingVertical: 40,
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: fonts.sizes.h2,
        fontFamily: fonts.families.bold,
        color: colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: fonts.sizes.regular,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
    },
    form: {
        width: '100%',
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'white',
    },
    button: {
        marginTop: 8,
        marginBottom: 20,
    },
    linkContainer: {
        alignItems: 'center',
    },
    linkText: {
        fontSize: fonts.sizes.small,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
    },
    linkBold: {
        fontFamily: fonts.families.semiBold,
        color: colors.primary,
    },
    errorText: {
        color: colors.danger,
        fontSize: fonts.sizes.small,
        fontFamily: fonts.families.regular,
        marginBottom: 10,
        marginLeft: 5,
    },
});
