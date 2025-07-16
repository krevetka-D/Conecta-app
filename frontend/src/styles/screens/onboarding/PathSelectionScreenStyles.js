// src/styles/screens/onboarding/PathSelectionScreenStyles.js
import { StyleSheet } from 'react-native';
import { colors, fonts } from '../../../constants/theme';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 20,
        paddingTop: 80,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: fonts.sizes.h2,
        fontFamily: fonts.families.bold,
        color: colors.text,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: fonts.sizes.lg,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 24,
    },
    pathContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    pathCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    pathIcon: {
        marginBottom: 16,
    },
    pathTitle: {
        fontSize: fonts.sizes.h3,
        fontFamily: fonts.families.semiBold,
        color: colors.text,
    },
    pathDescription: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
    },
});
