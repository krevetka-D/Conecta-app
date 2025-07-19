// src/styles/components/common/LoadingSpinnerStyles.js
import { StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../../../constants/theme';

export const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    fullScreen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.backdrop,
        zIndex: 999,
    },
    spinner: {
        marginBottom: spacing.sm,
    },
    text: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.sm,
    },
});