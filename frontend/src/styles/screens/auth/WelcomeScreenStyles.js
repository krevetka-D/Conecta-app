// frontend/src/styles/screens/auth/WelcomeScreenStyles.js

import { StyleSheet } from 'react-native';

import { colors, fonts } from '../../../constants/theme';

export const welcomeStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    title: {
        fontSize: fonts.sizes.h1,
        fontFamily: fonts.families.bold,
        color: 'white',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: fonts.sizes.large,
        fontFamily: fonts.families.regular,
        color: 'white',
        textAlign: 'center',
        marginBottom: 60,
        opacity: 0.9,
    },
    buttonContainer: {
        width: '100%',
    },
    primaryButton: {
        backgroundColor: 'white',
        paddingVertical: 16,
        borderRadius: 30,
        marginBottom: 16,
    },
    primaryButtonText: {
        color: colors.primary,
        fontSize: fonts.sizes.medium,
        fontFamily: fonts.families.semiBold,
        textAlign: 'center',
    },
    secondaryButton: {
        paddingVertical: 16,
    },
    secondaryButtonText: {
        color: 'white',
        fontSize: fonts.sizes.small,
        fontFamily: fonts.families.regular,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
});
