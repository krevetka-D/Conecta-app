// frontend/src/styles/screens/forums/ForumScreenStyles.js
// frontend/src/styles/screens/forums/ForumScreenStyles.js

import { StyleSheet } from 'react-native';

/**
 * This file now exports a FUNCTION.
 * This function takes the `theme` object as an argument and returns the stylesheet.
 * This prevents any code from running until a component calls this function.
 */
export const forumsStyles = (theme) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    listContent: {
        padding: theme.spacing.m,
    },
    headerSection: {
        marginBottom: theme.spacing.l,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    headerSubtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
        marginTop: theme.spacing.m,
    },
    categoryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: theme.spacing.s,
        color: theme.colors.primary,
    },
    
    forumCard: {
        marginBottom: theme.spacing.m,
        backgroundColor: theme.colors.card,
        borderRadius: theme.roundness,
    },
    forumHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    forumInfo: {
        flex: 1,
    },
    forumTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    forumDescription: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
    forumMeta: {
        flexDirection: 'row',
        marginTop: theme.spacing.m,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: theme.spacing.l,
    },
    metaText: {
        marginLeft: theme.spacing.xs,
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.primary,
    },
    modal: {
        backgroundColor: theme.colors.background,
        padding: theme.spacing.l,
        margin: theme.spacing.l,
        borderRadius: theme.roundness,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: theme.spacing.l,
        textAlign: 'center',
    },
    input: {
        marginBottom: theme.spacing.m,
    },
    errorText: {
        color: theme.colors.error,
        marginBottom: theme.spacing.m,
        marginTop: -theme.spacing.s,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: theme.spacing.m,
    },
    modalButton: {
        marginLeft: theme.spacing.m,
    },
});
