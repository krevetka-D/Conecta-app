// src/constants/theme.js
import { DefaultTheme } from 'react-native-paper';

// Color Palette
export const colors = {
    // Primary colors
    primary: '#1E3A8A',
    primaryLight: '#3B5FD3',
    primaryDark: '#0F1E4A',

    // Secondary colors
    secondary: '#3B82F6',
    secondaryLight: '#60A5FA',
    secondaryDark: '#1D4ED8',

    // Accent colors
    accent: '#10B981',
    accentLight: '#34D399',
    accentDark: '#059669',

    // Neutral colors
    background: '#F3F4F6',
    surface: '#FFFFFF',
    surfaceVariant: '#F9FAFB',

    // Text colors
    text: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textInverse: '#FFFFFF',

    // Semantic colors
    error: '#EF4444',
    errorLight: '#FCA5A5',
    errorDark: '#DC2626',

    success: '#10B981',
    successLight: '#6EE7B7',
    successDark: '#059669',

    warning: '#F59E0B',
    warningLight: '#FCD34D',
    warningDark: '#D97706',

    info: '#3B82F6',
    infoLight: '#93C5FD',
    infoDark: '#1E40AF',

    // UI colors
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    borderDark: '#D1D5DB',

    disabled: '#9CA3AF',
    placeholder: '#9CA3AF',
    backdrop: 'rgba(0, 0, 0, 0.5)',

    // Card colors
    cardBackground: '#FFFFFF',
    cardBorder: '#E5E7EB',

    // Status colors
    online: '#10B981',
    offline: '#6B7280',
    busy: '#F59E0B',

    // Shadow color
    shadow: '#000000',
};

// Typography
export const fonts = {
    families: {
        regular: 'Poppins-Regular',
        semiBold: 'Poppins-SemiBold',
        bold: 'Poppins-Bold',
    },
    sizes: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 32,
        display: 40,
    },
    lineHeights: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
    weights: {
        normal: '400',
        medium: '500',
        semiBold: '600',
        bold: '700',
    },
};

// Spacing
export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 20,
    xl: 30,
    xxl: 40,
    xxxl: 60,
};

// Border Radius
export const borderRadius = {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 30,
    round: 9999,
};

// Shadows
export const shadows = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    sm: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    lg: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    xl: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
};

// Layout
export const layout = {
    maxWidth: 600,
    contentPadding: spacing.lg,
    headerHeight: 56,
    tabBarHeight: 60,
};

// React Native Paper Theme
export const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: colors.primary,
        secondary: colors.secondary,
        accent: colors.accent,
        background: colors.background,
        surface: colors.surface,
        error: colors.error,
        text: colors.text,
        placeholder: colors.placeholder,
        backdrop: colors.backdrop,
        notification: colors.info,
    },
    fonts: {
        ...DefaultTheme.fonts,
        regular: {
            fontFamily: fonts.families.regular,
            fontWeight: fonts.weights.normal,
        },
        medium: {
            fontFamily: fonts.families.semiBold,
            fontWeight: fonts.weights.semiBold,
        },
        light: {
            fontFamily: fonts.families.regular,
            fontWeight: fonts.weights.normal,
        },
        thin: {
            fontFamily: fonts.families.regular,
            fontWeight: fonts.weights.normal,
        },
    },
    roundness: borderRadius.md,
};