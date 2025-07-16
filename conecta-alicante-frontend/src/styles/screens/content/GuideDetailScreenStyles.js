// src/styles/screens/content/GuideDetailScreenStyles.js
import { StyleSheet } from 'react-native';
import { colors, fonts, spacing, borderRadius } from '../../../constants/theme';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    webView: {
        flex: 1,
    },
    webViewLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    title: {
        fontSize: fonts.sizes.xxl,
        fontFamily: fonts.families.bold,
        color: colors.text,
        marginBottom: spacing.sm,
        lineHeight: fonts.sizes.xxl * fonts.lineHeights.tight,
    },
    metadata: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: spacing.lg,
        gap: spacing.sm,
    },
    tag: {
        backgroundColor: colors.primaryLight + '20',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    tagText: {
        fontSize: fonts.sizes.sm,
        fontFamily: fonts.families.regular,
        color: colors.primary,
    },
    body: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
        color: colors.text,
        lineHeight: fonts.sizes.md * fonts.lineHeights.relaxed,
    },
    relatedSection: {
        marginTop: spacing.xxl,
        paddingTop: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    relatedTitle: {
        fontSize: fonts.sizes.lg,
        fontFamily: fonts.families.semiBold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    relatedCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    relatedCardTitle: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
        color: colors.text,
        flex: 1,
    },
});