// src/styles/screens/main/ProfileScreenStyles.js
import { StyleSheet } from 'react-native';
import { colors, fonts } from '../../../constants';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    profileHeader: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: colors.surface,
    },
    name: {
        fontSize: fonts.sizes.h3,
        fontFamily: fonts.families.bold,
        marginTop: 12,
    },
    email: {
        fontSize: fonts.sizes.md,
        color: colors.textSecondary,
        marginTop: 4,
    },
    logoutButton: {
        marginTop: 30,
        marginHorizontal: 20,
    },
});
