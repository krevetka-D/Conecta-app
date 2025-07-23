// src/styles/components/ui/InputStyles.js
import { StyleSheet } from 'react-native';

import { colors, fonts } from '../../../constants/theme';

export const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.semiBold,
        color: colors.text,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    input: {
        flex: 1,
        padding: 12,
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
        color: colors.text,
    },
    errorText: {
        color: colors.error,
        fontSize: fonts.sizes.sm,
        marginTop: 4,
    },
});
