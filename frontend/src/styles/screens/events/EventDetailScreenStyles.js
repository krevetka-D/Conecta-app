// frontend/src/styles/screens/events/EventDetailScreenStyles.js
import { StyleSheet } from 'react-native';
import { colors } from '../../../constants/theme';
import { dimensions } from '../../../constants/dimensions';

export const eventDetailStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        // Add padding or other global styles for the screen container
        padding: dimensions.spacing.medium,
    },
    title: {
        fontSize: dimensions.font.extraLarge,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: dimensions.spacing.small,
    },
    // Add more styles here as needed for the elements on your EventDetailScreen
    // e.g., eventImage: {}, eventInfo: {}, buttonContainer: {},
});