// frontend/src/styles/screens/events/CreateEventScreenStyles.js
import { StyleSheet } from 'react-native';

export const createEventStyles = (theme) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        padding: theme.spacing.m,
        paddingBottom: theme.spacing.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginTop: theme.spacing.l,
        marginBottom: theme.spacing.m,
    },
    input: {
        marginBottom: theme.spacing.m,
        backgroundColor: theme.colors.surface,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: -theme.spacing.s,
        marginBottom: theme.spacing.m,
        marginLeft: theme.spacing.xs,
    },
    dateTimeSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.backdrop,
        borderRadius: theme.roundness,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.m,
    },
    dateTimeText: {
        fontSize: 16,
        color: theme.colors.text,
        marginLeft: theme.spacing.m,
    },
    selectorButton: {
        marginBottom: theme.spacing.m,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.backdrop,
        borderRadius: theme.roundness,
        padding: theme.spacing.m,
    },
    selectorContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectorTextContainer: {
        flex: 1,
        marginLeft: theme.spacing.m,
    },
    selectorLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    selectorValue: {
        fontSize: 16,
        color: theme.colors.text,
        fontWeight: '500',
    },
    radioSection: {
        marginBottom: theme.spacing.l,
    },
    radioLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.s,
    },
    radioOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: theme.spacing.l,
        marginBottom: theme.spacing.s,
    },
    radioText: {
        fontSize: 14,
        color: theme.colors.text,
    },
    tagSection: {
        marginBottom: theme.spacing.l,
    },
    tagInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    tagInput: {
        flex: 1,
        marginRight: theme.spacing.s,
        backgroundColor: theme.colors.surface,
    },
    addTagButton: {
        marginTop: 2,
    },
    tagsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.s,
    },
    tag: {
        backgroundColor: theme.colors.primary + '20',
    },
    submitContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing.xl,
        gap: theme.spacing.m,
    },
    cancelButton: {
        flex: 1,
    },
    submitButton: {
        flex: 1,
    },
    modal: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.l,
        margin: theme.spacing.l,
        borderRadius: theme.roundness * 2,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.l,
        textAlign: 'center',
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.m,
        borderRadius: theme.roundness,
        marginBottom: theme.spacing.s,
    },
    modalOptionSelected: {
        backgroundColor: theme.colors.primary + '10',
    },
    modalOptionText: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.text,
        marginLeft: theme.spacing.m,
    },
    modalOptionTextSelected: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
});