// frontend/src/styles/screens/auth/RegisterScreenStyles.js

import { StyleSheet } from 'react-native';
import { colors, fonts, spacing, borderRadius, shadows } from '../../../constants/theme';

export const registerStyles = StyleSheet.create({
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
        marginBottom: 30,
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
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'white',
    },
    button: {
        marginTop: 24,
        marginBottom: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        gap: spacing.md,
    },
    backButton: {
        flex: 1,
    },
    nextButton: {
        flex: 2,
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
        color: colors.error,
        fontSize: fonts.sizes.small,
        fontFamily: fonts.families.regular,
        marginBottom: 10,
        marginLeft: 5,
    },
    
    // Professional Path Selection Styles
    pathSection: {
        marginTop: spacing.lg,
        marginBottom: spacing.md,
    },
    pathTitle: {
        fontSize: fonts.sizes.lg,
        fontFamily: fonts.families.semiBold,
        color: colors.text,
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    pathSubtitle: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    pathCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        borderColor: colors.border,
        marginBottom: spacing.sm,
        padding: spacing.md,
        ...shadows.sm,
    },
    pathCardSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight + '10',
    },
    pathCardError: {
        borderColor: colors.error,
    },
    pathCardContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    pathCardTextContainer: {
        flex: 1,
        marginLeft: spacing.sm,
    },
    pathCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    pathCardTitle: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.semiBold,
        color: colors.text,
        marginLeft: spacing.sm,
    },
    pathCardDescription: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        lineHeight: fonts.sizes.sm * fonts.lineHeights.normal,
    },
    
    // Checklist Selection Styles
    checklistContainer: {
        maxHeight: 400,
        marginBottom: spacing.md,
    },
    checklistCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.sm,
        padding: spacing.md,
        ...shadows.sm,
    },
    checklistCardSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight + '10',
    },
    checklistCardContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    checklistTextContainer: {
        flex: 1,
        marginLeft: spacing.sm,
    },
    checklistTitle: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.semiBold,
        color: colors.text,
        marginBottom: spacing.xs / 2,
    },
    checklistDescription: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        lineHeight: fonts.sizes.sm * fonts.lineHeights.normal,
    },
});