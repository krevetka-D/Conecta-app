// src/styles/screens/onboarding/PrioritySelectionScreenStyles.js
import { StyleSheet } from 'react-native';
import { colors } from '../../../constants/theme';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    header: {
        marginBottom: 30,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        color: colors.text,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: colors.textSecondary,
        lineHeight: 24,
    },
    prioritiesContainer: {
        marginBottom: 40,
    },
    priorityCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    priorityCardSelected: {
        borderColor: colors.primary,
        backgroundColor: '#F0F9FF',
    },
    priorityText: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: colors.text,
        marginLeft: 12,
    },
    priorityTextSelected: {
        fontFamily: 'Poppins-SemiBold',
        color: colors.primary,
    },
    footer: {
        marginBottom: 40,
    },
    footerText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 20,
    },
    completeButton: {
        borderRadius: 30,
    },
    completeButtonContent: {
        paddingVertical: 8,
    },
});