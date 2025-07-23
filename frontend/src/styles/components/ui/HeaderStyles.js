// frontend/src/styles/components/ui/HeaderStyles.js
import { StyleSheet, Platform } from 'react-native';

import { colors, fonts, spacing } from '../../../constants/theme';

export const headerStyles = StyleSheet.create({
    container: {
        backgroundColor: colors.primary,
        paddingTop: Platform.OS === 'ios' ? 44 : 24, // SafeArea padding
        paddingBottom: 16,
    },
    default: {
        backgroundColor: colors.primary,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        minHeight: 56,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
    },
    defaultTitle: {
        color: '#fff',
    },
    subtitle: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.8,
        marginTop: 2,
    },
    defaultSubtitle: {
        color: '#fff',
    },
    rightAction: {
        marginLeft: 8,
    },
});
