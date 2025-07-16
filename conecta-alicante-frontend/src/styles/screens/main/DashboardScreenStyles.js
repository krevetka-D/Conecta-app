// src/styles/screens/main/DashboardScreenStyles.js
import { StyleSheet } from 'react-native';
import { colors, fonts } from '../../../constants';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: fonts.sizes.h2,
        fontFamily: fonts.families.bold,
        color: colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: fonts.sizes.lg,
        fontFamily: fonts.families.regular,
        color: colors.textSecondary,
        marginBottom: 24,
    },
});
