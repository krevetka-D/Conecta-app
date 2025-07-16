// src/styles/screens/checklist/ChecklistScreenStyles.js
import { StyleSheet } from 'react-native';
import { colors, fonts } from '../../../constants/theme';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
    },
    title: {
        fontSize: fonts.sizes.h2,
        fontFamily: fonts.families.bold,
        color: colors.text,
        marginBottom: 20,
    },
});
