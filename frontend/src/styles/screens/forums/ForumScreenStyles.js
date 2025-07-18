// frontend/src/styles/screens/forums/ForumsScreenStyles.js
import { StyleSheet } from 'react-native';
import { colors } from '../../../constants/theme';
import { dimensions } from '../../../constants/dimensions';


export const forumsStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: dimensions.spacing.large,
    },
    title: {
        fontSize: dimensions.font.large,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: dimensions.spacing.medium,
    },
    // Add more styles as needed for your forum screen components
});