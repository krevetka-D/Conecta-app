// src/styles/components/ui/HeaderStyles.js
import { StyleSheet, Platform } from 'react-native';
import { colors, fonts } from '../../../constants/theme';

export const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: colors.primary,
    },
    container: {
        height: Platform.OS === 'ios' ? 100 : 60,
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 40 : 0,
    },
    title: {
        fontSize: fonts.sizes.h3,
        fontFamily: fonts.families.bold,
        color: colors.textInverse,
    },
    leftAction: {
        minWidth: 40,
    },
    rightAction: {
        minWidth: 40,
        alignItems: 'flex-end',
    },
});
