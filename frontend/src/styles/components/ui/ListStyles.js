// src/styles/components/ui/ListStyles.js
import { StyleSheet } from 'react-native';

import { colors, fonts } from '../../../constants/theme';

export const styles = StyleSheet.create({
    listContainer: {
        flex: 1,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    listItemText: {
        fontSize: fonts.sizes.md,
        fontFamily: fonts.families.regular,
        color: colors.text,
        marginLeft: 16,
    },
    separator: {
        height: 1,
        backgroundColor: colors.border,
        marginLeft: 20,
    },
});
