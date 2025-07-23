// src/styles/components/ui/ModalStyles.js
import { StyleSheet } from 'react-native';

import { colors, fonts, spacing, borderRadius, shadows } from '../../../constants/theme';

export const styles = StyleSheet.create({
    modal: {
        margin: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomModal: {
        justifyContent: 'flex-end',
    },
    topModal: {
        justifyContent: 'flex-start',
    },
    fullScreenModal: {
        margin: 0,
    },
    keyboardAvoid: {
        flex: 1,
        justifyContent: 'center',
    },
    container: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        marginHorizontal: spacing.lg,
        maxWidth: 500,
        width: '100%',
        maxHeight: '90%',
        ...shadows.xl,
    },
    bottomContainer: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        marginHorizontal: 0,
        maxWidth: '100%',
    },
    topContainer: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        marginHorizontal: 0,
        maxWidth: '100%',
        marginTop: 0,
    },
    fullScreenContainer: {
        borderRadius: 0,
        margin: 0,
        maxWidth: '100%',
        maxHeight: '100%',
        flex: 1,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: colors.border,
        borderRadius: borderRadius.full,
        alignSelf: 'center',
        marginTop: spacing.sm,
        marginBottom: spacing.xs,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        fontSize: fonts.sizes.lg,
        fontFamily: fonts.families.semiBold,
        color: colors.text,
        flex: 1,
    },
    closeButton: {
        padding: spacing.xs,
        marginLeft: spacing.md,
    },
    body: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
    },
    scrollContent: {
        flexGrow: 1,
    },

    // Alert Modal Styles
    alertMessage: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: fonts.sizes.md * fonts.lineHeights.normal,
    },
    alertActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.md,
    },
    alertButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary,
        minWidth: 100,
    },
    alertButtonCancel: {
        backgroundColor: colors.background,
    },
    alertButtonDestructive: {
        backgroundColor: colors.error,
    },
    alertButtonText: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.semiBold,
        color: colors.textInverse,
        textAlign: 'center',
    },
    alertButtonTextCancel: {
        color: colors.text,
    },
    alertButtonTextDestructive: {
        color: colors.textInverse,
    },
});
