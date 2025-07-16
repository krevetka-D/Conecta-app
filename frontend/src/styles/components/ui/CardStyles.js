// src/styles/components/ui/CardStyles.js
import { StyleSheet } from 'react-native';
import { colors, fonts } from '../../../constants/theme';

export const styles = StyleSheet.create({
    base: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    elevated: {
        elevation: 5,
        shadowOpacity: 0.1,
    },
    paddingSmall: {
        padding: 8,
    },
    paddingMedium: {
        padding: 16,
    },
    paddingLarge: {
        padding: 24,
    },
    disabled: {
        opacity: 0.5,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: fonts.sizes.lg,
        fontFamily: fonts.families.semiBold,
        color: colors.text,
    },
    cardContent: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        lineHeight: 22,
    },
});
