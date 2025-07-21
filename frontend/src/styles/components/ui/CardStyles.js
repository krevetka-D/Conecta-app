import { StyleSheet } from 'react-native';
import { colors, shadows, borderRadius, spacing } from '../../../constants/theme';

export const styles = StyleSheet.create({
    base: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        ...shadows.md,
    },
    content: {
        borderRadius: borderRadius.md,
        // overflow will be set dynamically
    },
    
    // Variants
    elevated: {
        ...shadows.lg,
    },
    outlined: {
        borderWidth: 1,
        borderColor: colors.border,
        elevation: 0,
        shadowOpacity: 0,
    },
    flat: {
        elevation: 0,
        shadowOpacity: 0,
        backgroundColor: 'transparent',
    },
    
    // Padding variants
    paddingSmall: {
        padding: spacing.sm,
    },
    paddingMedium: {
        padding: spacing.md,
    },
    paddingLarge: {
        padding: spacing.lg,
    },
    paddingNone: {
        padding: 0,
    },
    
    // States
    disabled: {
        opacity: 0.6,
    },
});