// src/styles/components/common/EmptyStateStyles.js
import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '../../../constants/theme';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xxl,
        minHeight: 200,
    },
    icon: {
        marginBottom: spacing.lg,
        color: colors.textSecondary,
    },
    title: {
        fontSize: fonts.sizes.xl,
        fontFamily: fonts.families.semiBold,
        color: colors.text,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    message: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: fonts.sizes.md * fonts.lineHeights.normal,
        paddingHorizontal: spacing.lg,
    },
    actionContainer: {
        marginTop: spacing.xl,
    },
});
